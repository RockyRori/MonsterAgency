# Monster Agency

`Monster Agency` 是一个基于纯前端技术栈的怪物收集、战斗、经营、制作与放置收益原型。

当前实现使用 `Vite + React + TypeScript`，并且按项目规则拆分为：

- `frontend/src/content`: 静态游戏定义
- `frontend/src/domain`: 纯函数游戏规则
- `frontend/src/application`: 状态编排与交互用例
- `frontend/src/infra`: 浏览器持久化
- `frontend/src/ui`: 表现层辅助

## 本地开发

```bash
cd frontend
npm install
npm run dev
```

## 验证

```bash
cd frontend
npm run test
npm run build
```

## 当前可玩范围

- 地图探索与时间轴战斗
- 怪物编队与岗位分配
- 离线/放置收益结算
- 制作、出售与经济循环
- 主线/支线任务
- `localStorage` 存档
