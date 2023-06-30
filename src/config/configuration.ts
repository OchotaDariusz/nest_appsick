export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  production: process.env.NODE_ENV === 'production',
});
