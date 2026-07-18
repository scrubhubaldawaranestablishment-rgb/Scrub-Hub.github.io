//+------------------------------------------------------------------+
//| MultiSymbolBot.mq5 — Multi-pair automated trading EA             |
//| Architecture: ScanAllPairs() master loop, per-symbol state       |
//+------------------------------------------------------------------+
#property copyright "Multi-Symbol Bot"
#property version   "2.00"
#property strict

#include <Trade/Trade.mqh>

//--- Input: configurable symbol array
input string InpSymbols            = "EURUSD,GBPUSD,USDJPY,AUDUSD";
input ENUM_TIMEFRAMES InpHTF         = PERIOD_H1;
input ENUM_TIMEFRAMES InpLTF         = PERIOD_M5;
input int    InpMaxOpenPerSymbol     = 1;
input int    InpMaxSpreadPoints      = 25;
input double InpRiskPercent          = 1.0;
input double InpSLPips               = 15.0;
input double InpTPPips               = 30.0;
input int    InpRSIPeriod            = 14;
input double InpRSIOversold          = 35.0;
input double InpRSIOverbought        = 65.0;
input int    InpEMAFast              = 20;
input int    InpEMASlow              = 50;
input ulong  InpMagic                = 20260716;
input int    InpMaxConcurrentSignals = 3;
input double InpMinFreeMarginPct     = 30.0;

//--- Per-symbol state
struct SymbolState
  {
   string            symbol;
   int               ema_fast_h;
   int               ema_slow_h;
   int               rsi_h;
   datetime          last_bar_time;
   int               open_positions;
  };

CTrade   trade;
string   g_symbols[];
SymbolState g_states[];
datetime g_last_scan = 0;

//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(20);
   trade.SetTypeFilling(ORDER_FILLING_IOC);

   if(!ParseSymbols(InpSymbols, g_symbols))
     {
      Print("Failed to parse symbol list");
      return INIT_FAILED;
     }

   ArrayResize(g_states, ArraySize(g_symbols));
   for(int i = 0; i < ArraySize(g_symbols); i++)
     {
      string sym = g_symbols[i];
      if(!SymbolSelect(sym, true))
        {
         Print("SymbolSelect failed: ", sym);
         return INIT_FAILED;
        }
      g_states[i].symbol = sym;
      g_states[i].ema_fast_h = iMA(sym, InpHTF, InpEMAFast, 0, MODE_EMA, PRICE_CLOSE);
      g_states[i].ema_slow_h = iMA(sym, InpHTF, InpEMASlow, 0, MODE_EMA, PRICE_CLOSE);
      g_states[i].rsi_h      = iRSI(sym, InpLTF, InpRSIPeriod, PRICE_CLOSE);
      g_states[i].last_bar_time = 0;
      g_states[i].open_positions  = CountPositions(sym);
      Print("Initialized: ", sym, " positions=", g_states[i].open_positions);
     }

   Print("MultiSymbolBot ready | pairs=", ArraySize(g_symbols));
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   for(int i = 0; i < ArraySize(g_states); i++)
     {
      if(g_states[i].ema_fast_h != INVALID_HANDLE) IndicatorRelease(g_states[i].ema_fast_h);
      if(g_states[i].ema_slow_h != INVALID_HANDLE) IndicatorRelease(g_states[i].ema_slow_h);
      if(g_states[i].rsi_h      != INVALID_HANDLE) IndicatorRelease(g_states[i].rsi_h);
     }
  }

//+------------------------------------------------------------------+
void OnTick()
  {
   // Decoupled from chart symbol — scan all pairs on new LTF bar
   datetime bar_time = iTime(_Symbol, InpLTF, 0);
   if(bar_time == g_last_scan) return;
   g_last_scan = bar_time;
   ScanAllPairs();
  }

//+------------------------------------------------------------------+
void ScanAllPairs()
  {
   int signal_count = 0;
   string pending_symbols[];
   int    pending_sides[];
   double pending_sl[], pending_tp[], pending_lots[];

   for(int i = 0; i < ArraySize(g_states); i++)
     {
      string sym = g_states[i].symbol;
      g_states[i].open_positions = CountPositions(sym);

      if(g_states[i].open_positions >= InpMaxOpenPerSymbol) continue;
      if(!SpreadOK(sym)) continue;

      int side = EvaluateSignal(i);
      if(side == 0) continue;

      double lots = CalcLotSize(sym, InpSLPips);
      double entry, sl, tp;
      if(!BuildOrderPrices(sym, side, lots, entry, sl, tp)) continue;

      int n = ArraySize(pending_symbols);
      ArrayResize(pending_symbols, n + 1);
      ArrayResize(pending_sides,   n + 1);
      ArrayResize(pending_sl,      n + 1);
      ArrayResize(pending_tp,      n + 1);
      ArrayResize(pending_lots,    n + 1);

      pending_symbols[n] = sym;
      pending_sides[n]   = side;
      pending_sl[n]      = sl;
      pending_tp[n]      = tp;
      pending_lots[n]    = lots;
      signal_count++;
     }

   if(signal_count == 0) return;
   if(!GlobalMarginOK(signal_count)) return;

   for(int j = 0; j < ArraySize(pending_symbols); j++)
     {
      ExecuteOrder(pending_symbols[j], pending_sides[j], pending_lots[j],
                   pending_sl[j], pending_tp[j]);
     }
  }

//+------------------------------------------------------------------+
int EvaluateSignal(const int idx)
  {
   string sym = g_states[idx].symbol;
   double fast[], slow[], rsi[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(rsi,  true);

   if(CopyBuffer(g_states[idx].ema_fast_h, 0, 0, 3, fast) < 2) return 0;
   if(CopyBuffer(g_states[idx].ema_slow_h, 0, 0, 3, slow) < 2) return 0;
   if(CopyBuffer(g_states[idx].rsi_h,      0, 0, 3, rsi)  < 2) return 0;

   bool bullish = fast[0] > slow[0];
   bool bearish = fast[0] < slow[0];

   if(bullish && rsi[1] < InpRSIOversold && rsi[0] >= InpRSIOversold)
      return 1;  // BUY
   if(bearish && rsi[1] > InpRSIOverbought && rsi[0] <= InpRSIOverbought)
      return -1; // SELL
   return 0;
  }

//+------------------------------------------------------------------+
bool SpreadOK(const string sym)
  {
   double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
   double bid = SymbolInfoDouble(sym, SYMBOL_BID);
   double point = SymbolInfoDouble(sym, SYMBOL_POINT);
   if(point <= 0) return false;
   double spread_pts = (ask - bid) / point;
   if(spread_pts > InpMaxSpreadPoints)
     {
      Print(sym, " spread ", spread_pts, " > max ", InpMaxSpreadPoints);
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
int CountPositions(const string sym)
  {
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(!PositionSelectByTicket(PositionGetTicket(i))) continue;
      if(PositionGetString(POSITION_SYMBOL) == sym &&
         PositionGetInteger(POSITION_MAGIC) == (long)InpMagic)
         count++;
     }
   return count;
  }

//+------------------------------------------------------------------+
bool GlobalMarginOK(const int pending_count)
  {
   double balance     = AccountInfoDouble(ACCOUNT_BALANCE);
   double free_margin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   if(balance <= 0) return false;
   double free_pct = (free_margin / balance) * 100.0;
   if(free_pct < InpMinFreeMarginPct)
     {
      Print("Free margin ", free_pct, "% < min ", InpMinFreeMarginPct, "%");
      return false;
     }
   if(pending_count > InpMaxConcurrentSignals)
     {
      Print("Concurrent signals ", pending_count, " > max ", InpMaxConcurrentSignals);
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
double CalcLotSize(const string sym, const double sl_pips)
  {
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double risk_amt = balance * InpRiskPercent / 100.0;
   double tick_val = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE);
   double tick_size = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_SIZE);
   double point = SymbolInfoDouble(sym, SYMBOL_POINT);
   if(tick_size <= 0 || point <= 0 || sl_pips <= 0) return 0.01;

   double sl_price_dist = sl_pips * point * 10;
   double lots = risk_amt / (sl_price_dist / tick_size * tick_val);
   double min_lot = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double max_lot = SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX);
   double step    = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);
   lots = MathMax(min_lot, MathMin(max_lot, MathFloor(lots / step) * step));
   return lots;
  }

//+------------------------------------------------------------------+
bool BuildOrderPrices(const string sym, const int side, const double lots,
                      double &entry, double &sl, double &tp)
  {
   double point = SymbolInfoDouble(sym, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
   double pip = (StringFind(sym, "JPY") >= 0) ? point : point * 10;

   if(side > 0)
     {
      entry = SymbolInfoDouble(sym, SYMBOL_ASK);
      sl = NormalizeDouble(entry - InpSLPips * pip, digits);
      tp = NormalizeDouble(entry + InpTPPips * pip, digits);
     }
   else
     {
      entry = SymbolInfoDouble(sym, SYMBOL_BID);
      sl = NormalizeDouble(entry + InpSLPips * pip, digits);
      tp = NormalizeDouble(entry - InpTPPips * pip, digits);
     }
   return true;
  }

//+------------------------------------------------------------------+
void ExecuteOrder(const string sym, const int side, const double lots,
                  const double sl, const double tp)
  {
   trade.SetExpertMagicNumber(InpMagic);
   bool ok = false;
   if(side > 0)
      ok = trade.Buy(lots, sym, 0, sl, tp, "msbot");
   else
      ok = trade.Sell(lots, sym, 0, sl, tp, "msbot");

   if(!ok)
     {
      int err = GetLastError();
      Print("ExecuteOrder failed on ", sym, " err=", err, " retcode=", trade.ResultRetcode(),
            " comment=", trade.ResultComment());
      // 4756-class failures: invalid stops / send rejected
      return;
     }

   string dir = (side > 0) ? "BUY" : "SELL";
   Print("⚡️ ", dir, " Signal Triggered on ", sym,
         " entry=", trade.ResultPrice(),
         " ticket=", trade.ResultOrder(),
         " time=", TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS));
  }

//+------------------------------------------------------------------+
bool ParseSymbols(const string csv, string &out[])
  {
   string parts[];
   int n = StringSplit(csv, ',', parts);
   if(n <= 0) return false;
   ArrayResize(out, n);
   for(int i = 0; i < n; i++)
     {
      StringTrimLeft(parts[i]);
      StringTrimRight(parts[i]);
      out[i] = parts[i];
     }
   return true;
  }
//+------------------------------------------------------------------+
