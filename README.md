# hexo-bangumi-page

为你的 Hexo 博客创建 [Bangumi 番组计划](https://bangumi.tv/) 番剧页面。

# 使用

## 安装插件

```npm
npm install hexo-bangumi-page --save
```

## 获取数据

### 获取用户番剧列表

```npm
hexo bangumi -u
```

会更新用户追番的进度。

### 获取番剧详情

```npm
hexo bangumi -d
```

只需要在有新番加入的时候获取。

### 删除缓存

```npm
hexo bangumi -c
```


# 配置

```yaml
bangumi:
  user: {userId} # 必填 你的 userid
	# 在 bangumi 个人页面的 url 中的一串字符串（如果你设置了）或数字
	showImgAlt: false # 选填 true|false 默认 true
	# 有的主题会对带有 alt 的 img 标签生成奇怪的标签破坏布局
```

# 效果

![Sample-Img](https://cdn.jsdelivr.net/gh/KiritaniAyaka/Static/hexo-bangumi-page/sample-img-1.png)

