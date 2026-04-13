# Monster Agency

`Monster Agency` 现在是一个基于纯前端技术栈的武器店经营 RPG 原型。

- 店铺与锻造参考 `Weapon Shop Fantasy`
- 地图探索与战斗参考 `Neo Monsters`

当前实现使用 `Vite + React + TypeScript`，并按项目规则拆分为：

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

- 冒险者岗位分配
- 武器与护甲锻造
- 展柜上架与店铺营业
- 走格子探索
- 时间轴手动战斗
- 主线/订单任务
- `localStorage` 存档
