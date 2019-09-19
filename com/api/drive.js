const Item = require('mm_machine').Item;
const Param = require('../param/drive').Drive; // 是MM自带的参数机制，可以不使用
const Sql = require('../sql/drive').Drive; // 是MM自带的参数机制，可以不使用
const Oauth = require('./oauth').Oauth; // 是MM自带的身份验证机制，基于Oauth2.0，可以不使用
const Ret = require('mm_ret').Ret;
const CacheBase = require('mm_cachebase').CacheBase;

if (!$.dict) {
	if (!$.dict.session_id) {
		$.dict.session_id = "mm:uuid";
	}
}

if (!$.cache) {
	$.cache = new CacheBase();
}

/**
 * @description  Api接口驱动类
 * @extends {Item}
 * @class
 */
class Drive extends Item {
	/**
	 * @description 构造函数
	 * @param {String} dir 当前目录
	 * @constructor
	 */
	constructor(dir) {
		super(dir, __dirname);
		this.default_file = "./api.json";

		// oauth身份验证配置 + 函数
		this.oauth;
		// param参数配置 + 函数
		this.param;
		// sql模板配置 + 函数
		this.sql;
		/* 通用项 */
		// 配置参数
		this.config = {
			// 标题, 介绍接口作用
			"title": "示例接口",
			// 描述, 用于描述该接口有什么用的
			"description": "暂无描述",
			// 名称, 由中英文和下“_”组成, 用于卸载接口 例如: demo
			"name": "",
			// 路径 例如：/demo
			"path": "",
			// 文件路径, 当调用函数不存在时，会先从文件中加载
			"func_file": "",
			// 回调函数名 用于决定调用脚本的哪个函数
			"func_name": "",
			// 请求方式, POST或GET, 为空或ALL表示都可以
			"method": "GET",
			// 缓存时长 (单位：秒) 默认：60秒，建议600秒
			"cache": 0,
			// 是否用客户端缓存，即 http 304 状态
			"client_cache": true,
			// param参数验证路径 例如: ./param.json
			"param_path": "",
			// sql模板路径 例如: ./sql.json
			"sql_path": "",
			// 是否验证参数
			"check_param": true,
			// oauth身份验证模型, 参考oauth文件
			"oauth": null
		};

		/**
		 * @description 加载完成后执行
		 */
		Drive.prototype.load_after = function() {
			this.loadParam(this.config.param_path);
			this.loadSql(this.config.sql_path);
			this.loadOauth();
		};

		/**
		 * @description 设置参数对象
		 * @param {Object} param 参数对象
		 */
		Drive.prototype.setParam = function(param) {
			if ($.param) {
				var lt = $.param.list;
				if (lt) {
					var has = false;
					for (var i = 0; i < lt.length; i++) {
						var o = lt[i];
						if (param.filename === o.filename) {
							$.param.list[i] = param;
							has = true;
							break;
						}
					}
					if (!has) {
						$.param.list.push(param);
					}
				}
			}
		};

		/**
		 * @description 获取现有参数
		 * @param {String} file 文件名
		 * @return {Object} 获取的对象
		 */
		Drive.prototype.getParam = function(file) {
			if ($.param) {
				var obj = $.param.list.getObj({
					filename: file
				});
				if (obj) {
					return obj;
				}
			}
			return null;
		};

		/**
		 * @description 加载参数
		 * @param {String} file_path 文件路径
		 */
		Drive.prototype.loadParam = async function(file_path) {
			if (file_path) {
				var p = file_path.fullname(this.dir);
				var param = this.getParam(p);
				if (param) {
					this.param = param;
				} else {
					this.param = new Param(this.dir);
					this.param.load(p);
					this.setParam(this.param);
				}
			}
		};

		/**
		 * @description 设置Sql
		 * @param {Object} param sql对象
		 */
		Drive.prototype.setSql = function(sql) {
			if ($.sql) {
				var lt = $.sql.list;
				if (lt) {
					var has = false;
					for (var i = 0; i < lt.length; i++) {
						var o = lt[i];
						if (sql.filename === o.filename) {
							$.sql.list[i] = sql;
							has = true;
							break;
						}
					}
					if (!has) {
						$.sql.list.push(sql);
					}
				}
			}
		};

		/**
		 * @description 获取现有sql模板
		 * @param {String} file 文件名
		 * @return {Object} 获取的对象
		 */
		Drive.prototype.getSql = function(file) {
			if ($.sql) {
				var lt = $.sql.list;
				if (lt) {
					var obj = lt.getObj({
						filename: file
					});
					if (obj) {
						return obj;
					}
				}
			}
			return null;
		};

		/**
		 * @description 加载sql模板
		 * @param {String} file_path 文件路径
		 */
		Drive.prototype.loadSql = async function(file_path) {
			if (file_path) {
				var p = file_path.fullname(this.dir);
				var sql = this.getSql(p);
				if (sql) {
					this.sql = sql;
				} else {
					this.sql = new Sql(this.dir);
					this.sql.load(p);
					this.setSql(this.sql);
				}
			}
		};

		/**
		 * @description 加载身份验证配置
		 * @param {Object} cg 配置对象
		 */
		Drive.prototype.loadOauth = function() {
			var cg = this.config.oauth;
			if (cg) {
				this.oauth = new Oauth(this.dir);
				this.oauth.loadObj(cg);
			}
		};

		/* 回调函数集 */
		/**
		 * @description 主要函数
		 * @param {Object} ctx 请求上下文
		 * @param {Object} db 数据管理器
		 * @return {Object} 执行结果
		 */
		Drive.prototype.main = async function(ctx, db) {
			if (this.sql) {
				var req = ctx.request;
				var user = ctx.session.user;
				if (user) {
					db.user = user;
				}
				var ret = await this.sql.run(req.query, req.body, db);
				return ret;
			} else {
				return $.ret.error(10000, "接口函数未定义");
			}
		};

		/**
		 * @description 调用函数
		 * @param {Object} ctx  请求上下文
		 * @param {Object} db 数据管理器
		 * @return {Object} 执行结果
		 */
		Drive.prototype.run = async function(ctx, db) {
			var body = await this.getCache(ctx);
			if (!body) {
				var req = ctx.request;
				var t = req.type;
				var type;
				/// 设置响应头
				if (!t || t.indexOf('json') !== -1 || t.indexOf('form') !== -1) {
					type = "application/json";
				} else {
					type = "text/plain";
				}
				var ret;
				var md = this.config["method"].toLocaleUpperCase();
				if (md !== req.method && md !== "ALL") {
					return null;
				}
				var error = await this.check(ctx);
				if (error) {
					ret = $.ret.body(null, error);
				} else {
					ret = await this.main(ctx, db);
				}
				var res = ctx.response;
				body = this.body(ret, res, type);
				this.setCache(ctx, body, type);
			}
			return body;
		};

		/**
		 * @description 获取缓存
		 * @param {Object} ctx 请求上下文
		 * @return {String} 响应内容
		 */
		Drive.prototype.getCache = async function(ctx) {
			var req = ctx.request;
			if (this.config.client_cache) {
				var etag = req.headers['if-none-match'];
				if (etag) {
					var stamp = Number(etag.replace('"', '').replace('"', ''));
					var cha = stamp * 1000 - Date.parse(new Date());
					if (cha > 0) {
						ctx.response.status = 304;
						return ' ';
					}
				}
			}
			var userID = "(everyone)";
			var id = ctx.cookies.get($.dict.session_id);
			if (id) {
				userID = id;
			}
			var data = await $.cache.get("api_" + userID + ":" + req.url);
			if (data) {
				var obj = JSON.parse(data);
				ctx.response.type = obj.type;
				return obj.body;
			} else {
				return null;
			}
		};

		/**
		 * @description 设置缓存
		 * @param {Object} ctx 请求上下文
		 * @param {Object} body 正文参数
		 */
		Drive.prototype.setCache = async function(ctx, body) {
			if (this.config.cache && ctx.method === 'GET') {
				ctx.set('Cache-Control', 'max-age=' + this.config.cache);
				if (this.config.client_cache) {
					ctx.etag = Date.parse(new Date()) / 1000 + this.config.cache;
					return " ";
				} else {
					var req = ctx.request;
					var o = {};
					o.body = body;
					o.type = ctx.response.type;
					var userID = "(everyone)";
					var id = ctx.cookies.get($.dict.session_id);
					if (id) {
						userID = id;
					}
					$.cache.set("api_" + userID + ":" + req.url, JSON.stringify(o), this.config.cache);
				}
			}
		};

		/**
		 * @description 调用函数
		 * @param {Object} ret 设置响应结果
		 * @param {Object} res 响应器
		 * @param {Object} type 响应内容类型
		 * @return {String} 处理后的响应结果
		 */
		Drive.prototype.body = function(ret, res, type) {
			if (ret) {
				var tp = typeof(ret);
				if (tp === "object") {
					if (!type) {
						type = res.type;
					} else {
						if (type.indexOf('json') !== -1) {
							type = "application/json";
						} else if (type.indexOf('html') !== -1) {
							type = "text/html";
						} else {
							type = "text/plain";
						}
						res.type = type;
					}
					if (type.indexOf('/json') !== -1 || type.indexOf('form') !== -1) {
						return $.toJson(ret);
					} else {
						return $.toXml(ret);
					}
				} else if (tp === "string") {
					ret = ret.trim();
					if (ret.startWith('{') && ret.endWith('}')) {
						res.type = "application/json";
					} else if (ret.startWith('[') && ret.endWith(']')) {
						res.type = "application/json";
					} else if (ret.endWith("</html>")) {
						res.type = "text/html";
					} else {
						res.type = "text/plain";
					}
				}
			}
			return ret;
		};

		/**
		 * @description 验证参数
		 * @param {Object} query url参数
		 * @param {Object} body 内容参数
		 * @param {String} method 方法
		 * @return {Object} 验证结果
		 */
		Drive.prototype.checkParam = function(query, body, method) {
			if (this.param) {
				var ret = this.param.check(query, body, method);
				if (ret) {
					return ret;
				}
			}
			return null;
		};

		/**
		 * @description 验证参数
		 * @param {Object} ctx 内容上下文
		 * @return {Object} 验证结果
		 */
		Drive.prototype.check = async function(ctx) {
			var error;
			if (this.config.check_param) {
				var req = ctx.request;
				error = this.checkParam(req.query, req.body, req.method);
			}
			if (!error) {
				error = await this.checkOauth(ctx);
			}
			return error;
		};

		/**
		 * @description 验证身份
		 * @param {Object} ctx 内容上下文
		 * @return {Object} 验证结果
		 */
		Drive.prototype.checkOauth = async function(ctx) {
			if (this.oauth) {
				return await this.oauth.check(ctx);
			} else {
				return null;
			}
		};
	}
}

exports.Drive = Drive;
