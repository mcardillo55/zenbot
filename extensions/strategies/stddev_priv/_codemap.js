module.exports = {
  _ns: 'zenbot',

  'strategies.stddev_priv': require('./strategy'),
  'strategies.list[]': '#strategies.stddev_priv'
}
