const base = require('./base');

/* 集合路由、导航，不开发前端的情况下可以将以下3行注释掉 */
const Nav = require('../com/nav').Nav;
$.nav = new Nav();
$.nav.update();

$.task = $.task_admin();

// 将Api的缓存改为cache方式
$.cache = $.cache_admin();

// 将Api的缓存改为redis方式，如果不用redis可以将以下4行注释掉
// var redis = $.redis_admin($.dict.server);
// redis.setConfig($.config.redis);
// redis.open();
// $.cache = redis;


/// 执行初始化服务
exports.run = function(server) {
	// 使用多路径静态文件处理器
	server.use(base.static);
	// 使用MM事件+接口处理器
	server.use(base.api);
	// 初始化函数写在这里
	// console.log('自定义的初始化函数');
};
