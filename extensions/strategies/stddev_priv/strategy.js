var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'stddev_priv',
    description: 'Buy when >2*stddev and sell when <1*stddev.',

    getOptions: function () {
      this.option('period', 'period length', String, '2m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('trend_ema', 'number of periods for trend EMA', Number, 20)
      this.option('upper_stddev', 'buy when greater than this stddev line', Number, 2)
      this.option('lower_stddev', 'sell when lower than this stddev line', Number, 1)
    },

    calculate: function (s) {
      get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
      get('lib.stddev')(s, 'trend_ema_stddev', s.options.trend_ema, 'trend_ema')
    },

    onPeriod: function (s, cb) {
        if (s.period.close > (s.period.trend_ema + (s.period.trend_ema_stddev * s.options.upper_stddev))) {
          if (s.trend !== 'above_2_stddev') {
            s.acted_on_trend = false
          }
          s.trend = 'above_2_stddev'
          s.signal = !s.acted_on_trend ? 'buy' : null
          s.cancel_down = false
        }
        else if (s.period.close < (s.period.trend_ema + (s.period.trend_ema_stddev * s.options.lower_stddev))) {
          if (s.trend !== 'below_1_stddev') {
            s.acted_on_trend = false
          }
          s.trend = 'below_1_stddev'
          s.signal = !s.acted_on_trend ? 'sell' : null
        }
      cb()
    },

    onReport: function (s) {
    return []
      var cols = []
      if (typeof s.period.trend_ema_stddev === 'number') {
        var color = 'grey'
        if (s.period.trend_ema_rate > s.period.trend_ema_stddev) {
          color = 'green'
        }
        else if (s.period.trend_ema_rate < (s.period.trend_ema_stddev * -1)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[color])
        if (s.period.trend_ema_stddev) {
          cols.push(z(8, n(s.period.trend_ema_stddev).format('0.0000'), ' ').grey)
        }
      }
      else {
        if (s.period.trend_ema_stddev) {
          cols.push('                  ')
        }
        else {
          cols.push('         ')
        }
      }
      return cols
    }
  }
}
