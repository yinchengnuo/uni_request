# 欢迎使用 uni_request.js

最近在使用uni-app开发应用，因为用axios用的太顺手了，就对uni.request方法做了一个封装，使其使用起来和axios方法和效果一样。因为是自己现做现用，api设计的都比较简单，代码不也不复杂，但是却很实用。如有BUG，还请不吝指出，非常感谢

----



## 使用


```javascript
import uni_request from './uni_request.js'

const request = uni_request({ // 有效配置项只有两个
	baseURL: 'http://192.168.0.13/dwbsapp', //baseURL
	timeout: 1111 // 超时时间 
})

request.interceptors.request.use(config => { // 请求拦截器（可以设置多个）
	console.log('请求拦截器')
	config.headers.TEST = 'TEST'
	return config
})

request.interceptors.response.use(response => { // 响应拦截器（可以设置多个）
	const { data: res } = response
	if (res.code === 200) {
		console.log('响应拦截器')
	}
	return response
})


request.overtime = () => { // 超时钩子函数（可以设置多个）
	console.log('超时了')
}

request.get('/').then(res => {
	console.log(res)
})
```
