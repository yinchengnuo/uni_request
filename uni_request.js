export default function ({ baseURL, timeout, headers }) {
	return new Proxy({
		get(url, data) { return this.request('GET', url, data) },
		post(url, data) { return this.request('POST', url, data) },
		put(url, data) { return this.request('PUT', url, data) },
		delete(url, data) { return this.request('DELETE', url, data) },
		connect(url, data) { return this.request('CONNECT', url, data) },
		head(url, data) { return this.request('HEAD', url, data) },
		options(url, data) { return this.request('OPTIONS', url, data) },
		reace(url, data) { return this.request('TRACE', url, data) },
		overtime: [],
		request(method, url, data) {
			let timer, requestTask, _watcher = { cancelHandle: null, cancel: () => _watcher.cancelHandle() }
			return new Proxy(new Promise((resolve, reject) => {
				requestTask = uni.request({
				    url: baseURL + url,
				    data,
					method,
					header: { ...this.interceptors.request.intercept({ headers: headers || {} }, method, url, data).headers },
				    success: res => {
						clearTimeout(timer)
						res.statusCode === 200 ? resolve(this.interceptors.response.intercept(res, method, url, data)) : reject(res)
				    },
					fail: res => {
						clearTimeout(timer)
						_watcher.abort ? reject('网络请求失败：主动取消') : reject('网络请求失败：（URL无效|无网络|DNS解析失败）')
					}
				})
				timer = setTimeout(() => {
					requestTask.abort()
					reject('网络请求时间超时')
					this.overtime.forEach(e => e())
				}, timeout)
				_watcher.cancelHandle = () => {
					_watcher.abort= true
					requestTask.abort()
				}
			}), { get: (target, prop) => prop === 'cancel' ? _watcher.cancel : Reflect.get(target, prop) })
		},
		interceptors: {
			request: {
				interceptors: [],
				use(fun) { this.interceptors.push(fun) },
				intercept(config) {
					this.interceptors.forEach(fun => config = fun(config))
					return config
				}
			},
			response: {
				interceptors: [],
				use(fun) { this.interceptors.push(fun) },
				intercept(response) {
					this.interceptors.forEach(fun => response = fun(response))
					return response.data
				}
			}
		}
	}, { set: (target, prop, value) => prop === 'overtime' ? target.overtime.push(value) : true })
}
