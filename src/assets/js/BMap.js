export default function MapLoader () {
  return new Promise((resolve, reject) => {
    if (window.BMap) {
      resolve(window.BMap)
    } else {
      var script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'http://api.map.baidu.com/api?v=2.0&ak=WKS6RhpuH1V2yfkz54i0u47sVsggGHBn&callback=onBMapCallback'
      script.onerror = reject
      document.head.appendChild(script)
    }
    window.initBMap = () => {
      resolve(window.BMap)
    }
  })
}
