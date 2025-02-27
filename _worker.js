//1、天书版2.5，修改版，支持反代功能，极简优化，最终版本，没什么好折腾的了
//2、支持反代开关，私钥开关，订阅隐藏开关功能，去除UUID限制，clash私钥防止被薅请求数
//3、修改了接口关闭逻辑，降低请求数和错误率（大幅度降低），CPU超出时间限制会增加一些（不过区别仅仅是原版主动切断，和超时了由CF自动切断的区别）
//4、简单修改了一下反代逻辑，原版在调用反代时会重复尝试带原CFIP去交互访问，导致可能的来回跳，导致使用反代的时候解析速度变慢，修改以后可以增加一点点解析速度（这是猜的，要是没有改进就算了）
//5、不用在意那些奇怪的变量名，根据后面注释的备注去改，大概也就前100行看一下备注就行，clash配置在底部，懂的可以根据自身需求修改
//6、纯手搓配置，去除任何API外链，不支持任何外部变量修改和API，直接在线workers改好了部署就行，这样安全性史无前例，由于是纯手搓配置，所以节点要填完，不能留空，否则会因为识别不到节点而订阅失败
//7、虽然加入了通用订阅，但是本人并未测试（已测试bypass没问题），请自行测试研究，如果不能用就算了，概不负责^_^
//8、由于本人仅使用openclash和clash meta，其他平台软件均未测试，请自行测试研究，要是不能用就算了，不负责改进，继续概不负责^_^
//9、由于本人纯菜，很多代码解释都是根据自己的理解瞎编的，专业的无视就好，单纯为了帮助小白理解代码大致原理^_^

import { connect } from 'cloudflare:sockets';

let 哎呀呀这是我的ID啊 = ["622511"]; //这是你的ID，去除UUID规格限制，支持大小写字母和数字任意组合，安全性提高更不容易扫出，就是订阅链接的ID，[域名/ID]进入订阅页面
let 哎呀呀这是我的虚假UUID = ["aad22fad-78c6-4c5d-8315-85e540434b47"]; //给订阅一个虚假UUID，因为很多客户端需要标准格式化的UUID，本worker并不验证UUID，这个UUID并不重要，只要是规格化的就行

let 咦这是我的私钥哎 = ["511622"]; //这是你的私钥，提高隐秘性安全性，就算别人扫到你的域名也无法链接，再也不怕别人薅请求数了^_^
let 私钥开关 = false //是否启用私钥功能，true启用，false不启用，因为私钥功能只支持clash，如果打算使用通用订阅则需关闭私钥功能

let 隐藏订阅 = false //选择是否隐藏订阅页面，false不隐藏，true隐藏，当然隐藏后自己也无法订阅，因为配置固定，适合自己订阅后就隐藏，防止被爬订阅，并且可以到下方添加嘲讽语^_^
let 嘲讽语 = "哎呀你找到了我，但是我就是不给你看，气不气，嘿嘿嘿" //隐藏订阅后，真实的订阅页面就会显示这段话，想写啥写啥

const 我的优选 = 'yx.cf02.us.kg' //CF的节点，填域名或IP，好的优选一个就够了，由于CFcdn常规13端口开放，可以生成4个notls和4个tls节点，只保留了8个非常规端口的

const 启用反代功能 = true //选择是否启用反代功能，false，true，现在你可以自由的选择是否启用反代功能了
const 反代IP = 'us02.cf02.us.kg' //反代IP或域名(当前填的是CM大佬的proxyip.fxxk.dedyn.io，建议用自己的)，不需要填端口，反代IP只是兜底策略，不能固定落地地区，可以结合非CF节点一起用并选择该节点，固定落地地区

const 特殊优选 = 'yx.cf02.us.kg' //非CF的节点，填域名或IP，结合你的反代一起使用的话，这个节点可以完全的固定落地地区，例如同时都使用美国的
const 特殊优选的端口 = '443' //非CF的节点端口
const 非CF节点是否打开tls = 'true' //非CF的节点TLS开关，true，false，通用订阅此功能无效，默认使用tls

const 我的备用ipv4 = 'www.visa.com' //备用节点，可以填自己的workers绑定的域名，CF自动小黄云代理，相当于有一个永久有效的备份节点，永不失联[这方法只针对托管域名到CF的玩家]
const 我的备用ipv4端口 = '443' //端口
const 我的备用ipv4是否打开tls = 'true' //TLS开关，true，false，通用订阅此功能无效，默认使用tls

const 我的备用ipv6 = 'www.visa.com' //IPV6备用节点，clash改了双栈优先IPV6，意思同上，都是自定义的，想填备份的也行，想填别人的或自己的vps也行，填自己优选的官方IPV6也行
const 我的备用ipv6端口 = '443' //端口
const 我的备用ipv6是否打开tls = 'true' //TLS开关，true，false，通用订阅此功能无效，默认使用tls

const 我的节点名字 = 'GIT天书' //自己的节点名字

const 回落路径 = '/?ed=2560' //回落路径，一般不用改 '/?ed=2560' 使用这个代码并开启域名--速度--优化--协议优化--0-RTT连接恢复，可以改善使用体验，猜的^_^

const 转码 = 'vl'
const 转码2 = 'ess'
const 符号 = '://'

const 小猫 = 'cla'
const 咪 = 'sh'

export default {
    async fetch(访问请求, 这个ID) {
        哎呀呀这是我的ID啊 = 这个ID.UID || 哎呀呀这是我的ID啊;
        const 读取我的请求标头 = 访问请求.headers.get('Upgrade');
        if (!读取我的请求标头 || 读取我的请求标头 !== 'websocket') {
            const url = new URL(访问请求.url);
            switch (url.pathname) {
                case `/${哎呀呀这是我的ID啊}`: {
                    const 订阅页面 = 给我订阅页面(哎呀呀这是我的ID啊, 访问请求.headers.get('Host'));
                    return new Response(`${订阅页面}`, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/plain;charset=utf-8",
                        }
                    });
                }
                case `/${哎呀呀这是我的ID啊}/${转码}${转码2}`: {
                    if (隐藏订阅) {
                    return new Response (`${嘲讽语}`, { //可以在这里添加你的嘲讽语句，气死个人，哈哈哈
                    status: 200,
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8",
                        }
                    });
                    } else {
                    const 通用配置文件 = 给我通用配置文件(哎呀呀这是我的ID啊, 访问请求.headers.get('Host'));
                    return new Response(`${通用配置文件}`, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/plain;charset=utf-8",
                        }
                    });
                  }
                }
                case `/${哎呀呀这是我的ID啊}/${小猫}${咪}`: {
                    if (隐藏订阅) {
                    return new Response (`${嘲讽语}`, { //可以在这里添加你的嘲讽语句，气死个人，哈哈哈
                    status: 200,
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8",
                        }
                    });
                    } else {
                    const 小猫咪配置文件 = 给我小猫咪配置文件(哎呀呀这是我的ID啊, 访问请求.headers.get('Host'));
                    return new Response(`${小猫咪配置文件}`, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/plain;charset=utf-8",
                        }
                    });
                  }
                }
                default:
                    url.hostname = 'www.subtitlecat.com'; //在这里添加伪装域名网站，建议自建的站点，或者国外小站;
                    url.protocol = 'https:';
                    访问请求 = new Request(url, 访问请求);
                    return await fetch(访问请求);
            }
        } else {
            if (私钥开关) {
            const 验证我的私钥 = 访问请求.headers.get('my-key')
            if (验证我的私钥 == 咦这是我的私钥哎) {
            return await 升级WS请求(访问请求);
            }
            }
            if (私钥开关 === false) {
            return await 升级WS请求(访问请求);
            }
        }
    }
};
//第一步，读取和构建基础访问结构
async function 升级WS请求(访问请求) {
    const 创建WS接口 = new WebSocketPair();
    const [客户端, WS接口] = Object.values(创建WS接口);
    WS接口.accept();
    const 读取我的加密访问内容数据头 = 访问请求.headers.get('sec-websocket-protocol') || '';
    const 读取解密后的WS数据流 = 创建我的WS服务链接(WS接口, 读取我的加密访问内容数据头);
    let TCP接口请求 = { value: null, };
    读取解密后的WS数据流.pipeTo(new WritableStream({
        async write(VL数据) {
            if (TCP接口请求.value) {
                const 传输数据 = TCP接口请求.value.writable.getWriter()
                await 传输数据.write(VL数据);
                传输数据.releaseLock();
                return;
            }
            const {
                访问地址 = '',
                访问端口 = '',
                创建原始数据索引,
                VL版本 = new Uint8Array([0, 0]),
            } = await VL进程标头(VL数据);
            const VL请求标头 = new Uint8Array([VL版本[0], VL版本[1]]);
            const 写入数据请求 = VL数据.slice(创建原始数据索引);
            TCP握手协议(TCP接口请求, 访问地址, 访问端口, 写入数据请求, WS接口, VL请求标头);
        },
    }));
    return new Response(null, {
        status: 101,
        webSocket: 客户端,
    });
}
//第二步，解密WS访问内容，建立WS服务监听状态
function 创建我的WS服务链接(WS服务, 解密我的访问数据) {
  	const 数据流 = new ReadableStream({
  	  	start(控制器) {
  	  	  	WS服务.addEventListener('message', (event) => {
  	  	  	    const message = event.data
  	  	  	    控制器.enqueue(message)
  	  	  	});
  	  	  	WS服务.addEventListener('close', () => {
                检查WS状态并关闭控制器(WS服务, 控制器)
  	  	  	});
  	  	  	const {earlyData} = 使用64位加解密(解密我的访问数据);
  	  	  	if (earlyData) { 控制器.enqueue(earlyData); };
  	  	}
  	});
  	return 数据流;
}
async function 检查WS状态并关闭控制器(WS服务, 控制器, 初始次数 = 0, 最大尝试次数 = 2, 等待延迟 = 50) {
  while (WS服务.readyState !== 3 && 初始次数 < 最大尝试次数) {
      await new Promise(resolve => setTimeout(resolve, 等待延迟));
      初始次数++;
  }
  if (WS服务.readyState !== 3) {
      WS服务.close();
  }
  控制器.close();
}
function 使用64位加解密(还原混淆字符) {
  还原混淆字符 = 还原混淆字符.replace(/-/g, '+').replace(/_/g, '/');
  const 解密数据 = atob(还原混淆字符);
  const 解密_你_个_丁咚_咙_咚呛 = Uint8Array.from(解密数据, (c) => c.charCodeAt(0));
  return { earlyData: 解密_你_个_丁咚_咙_咚呛.buffer };
}
//第三步，解读VL协议数据，建立客户端VL--workers的完整索引通道
async function VL进程标头(VL缓存) {
  	const VL头部数据 = new Uint8Array(VL缓存.slice(0, 1));
  	const 获取数据定位 = new Uint8Array(VL缓存.slice(17, 18))[0];
  	const 提取端口索引 = 18 + 获取数据定位 + 1;
  	const 建立端口缓存 = VL缓存.slice(提取端口索引, 提取端口索引 + 2);
  	const 访问端口 = new DataView(建立端口缓存).getUint16(0);
  	const 提取地址索引 = 提取端口索引 + 2;
  	const 建立地址缓存 = new Uint8Array(VL缓存.slice(提取地址索引, 提取地址索引 + 1));
  	const 识别地址类型 = 建立地址缓存[0];
  	let 地址长度 = 0;
  	let 地址信息 = '';
  	let 地址信息索引 = 提取地址索引 + 1;
  	switch (识别地址类型) {
  	  	case 1:
  	  	    地址长度 = 4;
  	  	    地址信息 = new Uint8Array(
  	  	        VL缓存.slice(地址信息索引, 地址信息索引 + 地址长度)
  	  	    ).join('.');
  	  	    break;
  	  	case 2:
  	  	    地址长度 = new Uint8Array(
  	  	        VL缓存.slice(地址信息索引, 地址信息索引 + 1)
  	  	    )[0];
  	  	    地址信息索引 += 1;
  	  	    地址信息 = new TextDecoder().decode(
  	  	        VL缓存.slice(地址信息索引, 地址信息索引 + 地址长度)
  	  	    );
  	  	    break;
  	  	case 3:
  	  	    地址长度 = 16;
  	  	    const dataView = new DataView(
  	  	        VL缓存.slice(地址信息索引, 地址信息索引 + 地址长度)
  	  	    );
  	  	    const ipv6 = [];
  	  	    for (let i = 0; i < 8; i++) {
  	  	        ipv6.push(dataView.getUint16(i * 2).toString(16));
  	  	    }
  	  	    地址信息 = ipv6.join(':');
  	  	    break;
  	} 	
  	return {
  	  	访问地址: 地址信息,
  	  	识别地址类型,
  	  	访问端口,
  	  	创建原始数据索引: 地址信息索引 + 地址长度,
  	  	VL版本: VL头部数据,
  	};
}
//第四步，建立VL--workers--外网的TCP握手协议
async function TCP握手协议(TCP接口请求, 访问地址, 访问端口, 写入数据请求, WS接口, VL返回标头) {
  	async function 连接写入请求(地址, 端口) {
  	    const tcp接口 = connect({ hostname: 地址, port: 端口, });
  	    TCP接口请求.value = tcp接口;
  	    const 传输数据 = tcp接口.writable.getWriter();
  	    await 传输数据.write(写入数据请求);
  	    传输数据.releaseLock();
  	    return tcp接口;
  	}
  	async function 反代兜底() {
  	    const tcp接口 = await 连接写入请求(反代IP, 访问端口) //反代兜底功能，实现逻辑是客户端访问地址--反代IP--实际外网访问地址，并以同样的通道返回数据
  	    TCP接口访问WS(tcp接口, WS接口, VL返回标头);
  	}
  	    const tcp接口 = await 连接写入请求(访问地址, 访问端口);
  	    TCP接口访问WS(tcp接口, WS接口, VL返回标头, 反代兜底);
}
//第五步，进行VL--workers--外网的WS数据传输，TCP握手成功后建立最终的WS数据传输通道
async function TCP接口访问WS(TCP远程接口, WS接口, VL报告标头, 重试使用反代兜底访问) {
  	let VL标头 = VL报告标头;
  	let 传入数据 = false;
  	await TCP远程接口.readable.pipeTo(new WritableStream({ 
  	  	  	async write(VL数据块) {
  	  	  	    传入数据 = true;
  	  	  	    if (VL标头) {
  	  	  	        WS接口.send(await new Blob([VL标头, VL数据块]).arrayBuffer());
  	  	  	        VL标头 = null;
  	  	  	    } else {
  	  	  	        WS接口.send(VL数据块);
  	  	  	    }
  	  	  	},
  	  	})
  	);
  	if (启用反代功能) {
  	    if (传入数据 == false && 重试使用反代兜底访问) { //当使用默认节点无法接收到返回数据时，启用反代兜底逻辑重试访问
  	        重试使用反代兜底访问();
  	    }
  	}
}
//小猫咪配置文件
function 给我订阅页面(哎呀呀这是我的ID啊, hostName) {
return `
1、本worker的私钥功能只支持${小猫}${咪}，仅open${小猫}${咪}和${小猫}${咪} meta测试过，其他clash类软件自行测试
2、若使用通用订阅请关闭私钥功能
3、其他需求自行研究
通用的：https://${hostName}/${哎呀呀这是我的ID啊}/${转码}${转码2}
猫咪的：https${符号}${hostName}/${哎呀呀这是我的ID啊}/${小猫}${咪}
`;
}
function 给我通用配置文件(哎呀呀这是我的ID啊, hostName) {
  const 特殊长链接Links = btoa(`${转码}${转码2}${符号}${哎呀呀这是我的虚假UUID}@${特殊优选}:${特殊优选的端口}?encryption=none&security=tls&sni=${hostName}&type=ws&host=${hostName}&path=%2F%3Fed%3D2560`);
  return `${特殊长链接Links}`
}
function 给我小猫咪配置文件(哎呀呀这是我的ID啊, hostName) {
return `
dns:
  nameserver:
    - 119.29.29.29
    - 223.5.5.5
  fallback:
    - 8.8.8.8
    - tls://dns.google
    - 2001:4860:4860::8888
proxies:
- name: ${我的节点名字}-非CF节点
  type: ${转码}${转码2}
  server: ${特殊优选}
  port: ${特殊优选的端口}
  uuid: ${哎呀呀这是我的虚假UUID}
  udp: false
  tls: ${非CF节点是否打开tls}
  network: ws
  ws-opts:
    path: "${回落路径}"
    headers:
      Host: ${hostName}
      my-key: ${咦这是我的私钥哎}
proxy-groups:
- name: 🚀 节点选择
  type: select
  proxies:
    - notls负载均衡
    - tls负载均衡
    - 自动选择
    - ${我的节点名字}-非CF节点
- name: 自动选择
  type: url-test
  url: http://www.gstatic.com/generate_204
  interval: 300
  tolerance: 50
  proxies:
    - ${我的节点名字}-非CF节点
- name: notls负载均衡
  type: load-balance
  url: http://www.gstatic.com/generate_204
  interval: 300
  proxies:
- name: tls负载均衡
  type: load-balance
  url: http://www.gstatic.com/generate_204
  interval: 300
  proxies:
- name: 非CF节点
  type: select
  proxies:
    - ${我的节点名字}-非CF节点
- name: 漏网之鱼
  type: select
  proxies:
    - DIRECT
    - 🚀 节点选择
    - 非CF节点
rules:
# 策略规则，部分规则需打开clash mate的使用geoip dat版数据库，比如TG规则就需要，或者自定义geoip的规则订阅
# 这是geoip的规则订阅链接，https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
# GPT规则
- DOMAIN-KEYWORD,openai,🚀 节点选择
- DOMAIN-SUFFIX,AI.com,🚀 节点选择
- DOMAIN-SUFFIX,cdn.auth0.com,🚀 节点选择
- DOMAIN-SUFFIX,openaiapi-site.azureedge.net,🚀 节点选择
- DOMAIN-SUFFIX,opendns.com,🚀 节点选择
- DOMAIN-SUFFIX,bing.com,🚀 节点选择
- DOMAIN-SUFFIX,civitai.com,🚀 节点选择
- DOMAIN,bard.google.com,🚀 节点选择
- DOMAIN,ai.google.dev,🚀 节点选择
- DOMAIN,gemini.google.com,🚀 节点选择
- DOMAIN-SUFFIX,googleapis.com,🚀 节点选择
- DOMAIN-SUFFIX,sentry.io,🚀 节点选择
- DOMAIN-SUFFIX,intercom.io,🚀 节点选择
- DOMAIN-SUFFIX,featuregates.org,🚀 节点选择
- DOMAIN-SUFFIX,statsigapi.net,🚀 节点选择
- DOMAIN-SUFFIX,claude.ai,🚀 节点选择
- DOMAIN-SUFFIX,Anthropic.com,🚀 节点选择
- DOMAIN-SUFFIX,opera-api.com,🚀 节点选择
- DOMAIN-SUFFIX,aistudio.google.com,🚀 节点选择
- DOMAIN-SUFFIX,auth0.com,🚀 节点选择
- DOMAIN-SUFFIX,challenges.cloudflare.com,🚀 节点选择
- DOMAIN-SUFFIX,chatgpt.com,🚀 节点选择
- DOMAIN-SUFFIX,client-api.arkoselabs.com,🚀 节点选择
- DOMAIN-SUFFIX,events.statsigapi.net,🚀 节点选择
- DOMAIN-SUFFIX,identrust.com,🚀 节点选择
- DOMAIN-SUFFIX,intercomcdn.com,🚀 节点选择
- DOMAIN-SUFFIX,oaistatic.com,🚀 节点选择
- DOMAIN-SUFFIX,oaiusercontent.com,🚀 节点选择
- DOMAIN-SUFFIX,openai.com,🚀 节点选择
- DOMAIN-SUFFIX,stripe.com,🚀 节点选择
# GPT规则
- GEOSITE,category-ads,REJECT #简单广告过滤规则，要增加规则数可使用category-ads-all
- GEOSITE,cn,DIRECT #国内域名直连规则
- GEOIP,CN,DIRECT,no-resolve #国内IP直连规则
- GEOSITE,cloudflare,DIRECT #CF域名直连规则
- GEOIP,CLOUDFLARE,DIRECT,no-resolve #CFIP直连规则
- GEOSITE,gfw,🚀 节点选择 #GFW域名规则
- GEOSITE,google,🚀 节点选择 #GOOGLE域名规则
- GEOIP,GOOGLE,🚀 节点选择,no-resolve #GOOGLE IP规则
- GEOSITE,netflix,🚀 节点选择 #奈飞域名规则
- GEOIP,NETFLIX,🚀 节点选择,no-resolve #奈飞IP规则
- GEOSITE,telegram,🚀 节点选择 #TG域名规则
- GEOIP,TELEGRAM,🚀 节点选择,no-resolve #TG IP规则
- MATCH,漏网之鱼
`
}
