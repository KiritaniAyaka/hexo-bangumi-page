# hexo-bangumi-page

为你的 Hexo 博客创建 [Bangumi 番组计划](https://bangumi.tv/) 番剧页面。

![Visitors](https://visit-count.vercel.app/api/count?id=KiritaniAyaka.hexo-bangumi-page)

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

在 `_config.yml` 中配置：

```yaml
bangumi:
  user: 123456 # 必填 你的 userid
  # 在 bangumi 个人页面的 url 中的一串字符串（如果你设置了）或数字
  showImgAlt: false # 选填 true|false 默认 true
  # 有的主题会对带有 alt 的 img 标签生成奇怪的标签破坏布局
  cover: large # 生成的番剧封面类型 值为 'grid', 'small', 'common', 'medium', 'large' 其中之一 默认为 large
  perPage: 20 # 每页展示的番剧数 默认不分页
```

# 效果

![Sample-Img](https://cdn.jsdelivr.net/gh/KiritaniAyaka/Static/hexo-bangumi-page/sample-img-1.png)

