require('dotenv').config(); // Load environment variables

const { Sequelize, Op } = require('sequelize');

const db = {};

// Load environment variables
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASS || !DB_NAME) {
    console.error("Missing database environment variables!");
    process.exit(1);
}

// Initialize Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false
});

db.Op = Op;

// Load models
db.Account = require('../accounts/account.model')(sequelize);
db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
db.Campaign = require('../campaigns/campaign.model')(sequelize);
db.Event = require('../events/event.model')(sequelize);
db.Donation = require('../donations/donation.model')(sequelize);
db.Reward = require('../rewards/reward.model')(sequelize);
db.RedeemReward = require('../redeemReward/redeemReward.model')(sequelize);
db.EventParticipant = require('../eventParticipant/eventParticipant.model')(sequelize);
db.Withdraw = require('../withdraw/withdraw.model')(sequelize);
db.Comment = require('../comment/comment.model')(sequelize);
db.Like = require('../like/like.model')(sequelize);
db.Category = require('../category/category.model')(sequelize);
db.Revenue = require('../Revenue/revenue.model')(sequelize);

// Define relationships (unchanged)
db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
db.RefreshToken.belongsTo(db.Account);

db.Account.hasMany(db.Campaign, { onDelete: 'CASCADE' });
db.Campaign.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });

db.Account.hasMany(db.Event, { foreignKey: 'Acc_ID', onDelete: 'CASCADE' });
db.Event.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });

db.Account.hasMany(db.Donation, { onDelete: 'CASCADE' });
db.Campaign.hasMany(db.Donation, { onDelete: 'CASCADE' });
db.Donation.belongsTo(db.Account, { foreignKey: 'acc_id', as: 'account' });
db.Donation.belongsTo(db.Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

db.Account.hasMany(db.Reward, { onDelete: 'CASCADE' });
db.Reward.belongsTo(db.Account);

db.Account.hasMany(db.RedeemReward, { onDelete: 'CASCADE' });
db.RedeemReward.belongsTo(db.Account);
db.Reward.hasMany(db.RedeemReward, { onDelete: 'CASCADE' });
db.RedeemReward.belongsTo(db.Reward);

db.Event.hasMany(db.EventParticipant, { onDelete: 'CASCADE' });
db.EventParticipant.belongsTo(db.Event, { foreignKey: 'Event_ID', as: 'event' });

db.Account.hasMany(db.EventParticipant, { onDelete: 'CASCADE' });
db.EventParticipant.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });

db.Account.hasMany(db.Withdraw, { foreignKey: 'acc_id', onDelete: 'CASCADE' });
db.Withdraw.belongsTo(db.Account, { foreignKey: 'acc_id' });
db.Campaign.hasMany(db.Withdraw, { foreignKey: 'Campaign_ID', onDelete: 'CASCADE' });
db.Withdraw.belongsTo(db.Campaign, { foreignKey: 'Campaign_ID' });

db.Campaign.hasMany(db.Comment, { foreignKey: 'Campaign_ID', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.Campaign, { foreignKey: 'Campaign_ID' });
db.Account.hasMany(db.Comment, { foreignKey: 'Acc_ID', onDelete: 'CASCADE' });
db.Comment.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });

db.Account.hasMany(db.Like, { foreignKey: 'Acc_ID', onDelete: 'CASCADE' });
db.Like.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });
db.Campaign.hasMany(db.Like, { foreignKey: 'Campaign_ID', onDelete: 'CASCADE' });
db.Like.belongsTo(db.Campaign, { foreignKey: 'Campaign_ID' });

db.Category.hasMany(db.Campaign, { foreignKey: 'Category_ID', onDelete: 'SET NULL' });
db.Campaign.belongsTo(db.Category, { foreignKey: 'Category_ID', as: 'category' });

db.Donation.hasMany(db.Revenue, { foreignKey: 'donation_id', onDelete: 'CASCADE' });
db.Revenue.belongsTo(db.Donation, { foreignKey: 'donation_id', as: 'donation' });
db.Revenue.belongsTo(db.Account, { foreignKey: 'Acc_ID', as: 'account' });

// Sync database
(async () => {
    try {
        await sequelize.sync();
        console.log("Database synchronized successfully.");
    } catch (err) {
        console.error("Database synchronization failed:", err);
    }
})();

db.sequelize = sequelize;

module.exports = db;
