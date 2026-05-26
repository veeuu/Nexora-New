const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'postgres', host: 'localhost', port: 5432, username: 'postgres', password: '123', database: 'nexora_auth', logging: false });
(async () => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`UPDATE users SET "creditsUsed"=0,"creditsBySection"='{"technographics":0,"renewal":0,"intent":0,"ntp":0,"buyingGroup":0}'::jsonb,"revealedRows"='{}'::jsonb WHERE email='veeekamble@gmail.com' RETURNING email,"creditsUsed"`);
    console.log(results.length ? `✅ Reset: ${results[0].email} — creditsUsed: ${results[0].creditsUsed}` : '⚠️ User not found');
  } catch (e) { console.error('❌', e.message); } finally { await sequelize.close(); }
})();
