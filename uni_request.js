export default function ({ baseURL, timeout }) {
	return new Proxy({
		get(url, data) {
			return this.request('GET', url, data)
		},
		post(url, data) {
			return this.request('POST', url, data)
		},
		put(url, data) {
			return this.request('PUT', url, data)
		},
		delete(url, data) {
			return this.request('DELETE', url, data)
		},
		connect(url, data) {
			return this.request('CONNECT', url, data)
		},
		head(url, data) {
			return this.request('HEAD', url, data)
		},
		options(url, data) {
			return this.request('OPTIONS', url, data)
		},
		reace(url, data) {
			return this.request('TRACE', url, data)
		},
		request(method, url, data) {
			return new Promise((resolve, reject) => {
				let timer;
				const requestTask = uni.request({
				    url: baseURL + url,
				    data,
					method,
					header: { ...this.interceptors.request.intercept({ headers: {} }, method, url, data).headers },
				    success: res => {
						clearTimeout(timer)
						if (res.statusCode === 200) {
							resolve(this.interceptors.response.intercept(res, method, url, data))
						} else {
							console.error( `网络请求响应错误：statusCode：${res.statusCode}，message：${res.data}`)
							reject(res)
						}
				    },
					fail: () => {
						console.error( '网络请求失败：（网络|DNS解析失败）')
						reject('网络请求失败：（网络|DNS解析失败）')
					}
				})
				timer = setTimeout(() => {
					requestTask.abort()
					console.error( '网络请求时间超时')
					reject('网络请求时间超时')
					this.overtime.forEach(e => e())
				}, timeout)
			})
		},
		interceptors: {
			request: {
				interceptors: [],
				use(fun) {
					this.interceptors.push(fun)
				},
				intercept(config) {
					this.interceptors.forEach(fun => {
						config = fun(config)
					})
					return config
				}
			},
			response: {
				interceptors: [],
				use(fun) {
					this.interceptors.push(fun)
				},
				intercept(response) {
					this.interceptors.forEach(fun => {
						response = fun(response)
					})
					return response.data
				}
			}
		},
		overtime: []
	}, {
		set(target, prop, value) {
			if (prop === 'overtime') {
				target.overtime.push(value)
			}
			return true
		}
	})
}
