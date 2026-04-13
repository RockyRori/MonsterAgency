import { gameContent } from "./content";
import { canCraftRecipe } from "./domain/crafting";
import type { EquipmentSlot, ItemDefinition } from "./domain/types";
import { useGameSession } from "./application/useGameSession";
import {
  formatInventoryEntries,
  formatPercent,
  formatQuestRequirement,
} from "./ui/formatters";

function getTileClass(symbol: string, active: boolean, visited: boolean) {
  if (active) {
    return "grid-tile grid-tile-active";
  }

  if (symbol === "#") {
    return "grid-tile grid-tile-wall";
  }

  if (!visited) {
    return "grid-tile grid-tile-fog";
  }

  if (symbol === "S") {
    return "grid-tile grid-tile-start";
  }

  if (symbol === "E") {
    return "grid-tile grid-tile-exit";
  }

  if (symbol === "M") {
    return "grid-tile grid-tile-battle";
  }

  if (symbol === "R") {
    return "grid-tile grid-tile-resource";
  }

  if (symbol === "T") {
    return "grid-tile grid-tile-treasure";
  }

  return "grid-tile";
}

function getEquipmentOptions(
  itemDefinitions: ItemDefinition[],
  inventory: Record<string, number>,
  slot: EquipmentSlot,
  equippedItemId?: string,
) {
  const options = itemDefinitions
    .filter((item) => item.equipmentSlot === slot)
    .filter((item) => (inventory[item.id] ?? 0) > 0 || item.id === equippedItemId);

  return options;
}

function App() {
  const session = useGameSession();
  const visited = new Set(session.state.exploration.visitedTileKeys);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Monster Agency</p>
          <h1>武器店经营 + 手动远征原型</h1>
          <p className="hero-copy">
            先在店里锻造与上架，再带着装备好的冒险者走格子远征，
            最后把战利品带回工坊继续滚动整个经营循环。
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={session.runShopDay}>
            运行一个营业班次
          </button>
          <button className="ghost-button" onClick={session.resetProgress}>
            重置存档
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>店铺金币</span>
          <strong>{session.state.gold}</strong>
        </article>
        <article className="stat-card">
          <span>锻造力</span>
          <strong>{session.smithingPower}</strong>
        </article>
        <article className="stat-card">
          <span>营业力</span>
          <strong>{session.counterPower}</strong>
        </article>
        <article className="stat-card">
          <span>累计营业额</span>
          <strong>{session.state.lifetime.soldGold}</strong>
        </article>
        <article className="stat-card">
          <span>已通关区域</span>
          <strong>{session.state.lifetime.clearedMapIds.length}</strong>
        </article>
        <article className="stat-card">
          <span>远征人数</span>
          <strong>{session.state.partyOrder.length}</strong>
        </article>
      </section>

      {session.battleReport && (
        <section className="panel battle-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Battle Report</p>
              <h2>{session.battleReport.title}</h2>
              <p>{session.battleReport.subtitle}</p>
            </div>
            <button className="ghost-button" onClick={session.dismissBattleReport}>
              收起
            </button>
          </div>
          <div className="battle-log">
            {session.battleReport.log.map((line, index) => (
              <p key={`${index}-${line}`}>{line}</p>
            ))}
          </div>
        </section>
      )}

      <main className="main-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Forge</p>
              <h2>工坊锻造</h2>
            </div>
            <p>当前可锻造配方 {session.recipes.length}</p>
          </div>
          <div className="recipe-grid">
            {session.recipes.map((recipe) => (
              <article key={recipe.id} className="recipe-card">
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
                <p>消耗：{formatInventoryEntries(recipe.inputs)}</p>
                <p>
                  锻造要求：{recipe.requiredSmithing} / 当前 {session.smithingPower}
                </p>
                <button
                  className="primary-button"
                  disabled={!canCraftRecipe(session.state, recipe)}
                  onClick={() => session.craft(recipe.id)}
                >
                  开始锻造
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Showcase</p>
              <h2>展柜与营业</h2>
            </div>
            <p>营业溢价：{formatPercent(Math.min(0.35, session.counterPower * 0.025))}</p>
          </div>
          <div className="inventory-list">
            {session.showcaseEntries.length === 0 ? (
              <p className="empty-copy">展柜还是空的，先把装备摆上去顾客才会买单。</p>
            ) : (
              session.showcaseEntries.map((entry) => (
                <article key={entry.itemId} className="inventory-row">
                  <div>
                    <h3>{gameContent.itemDefinitionsById[entry.itemId].name}</h3>
                    <p>{gameContent.itemDefinitionsById[entry.itemId].description}</p>
                  </div>
                  <div className="inventory-row-actions">
                    <span>x{entry.quantity}</span>
                    <button
                      className="secondary-button"
                      onClick={() => session.unstockItem(entry.itemId)}
                    >
                      撤回 1 件
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="inventory-list section-gap">
            {session.inventoryEntries
              .filter(
                (entry) =>
                  gameContent.itemDefinitionsById[entry.itemId].kind === "equipment",
              )
              .map((entry) => (
                <article key={entry.itemId} className="inventory-row">
                  <div>
                    <h3>{gameContent.itemDefinitionsById[entry.itemId].name}</h3>
                    <p>{gameContent.itemDefinitionsById[entry.itemId].description}</p>
                  </div>
                  <div className="inventory-row-actions">
                    <span>x{entry.quantity}</span>
                    <button
                      className="secondary-button"
                      onClick={() => session.stockItem(entry.itemId)}
                    >
                      上架 1 件
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Expedition</p>
              <h2>区域远征</h2>
            </div>
            <p>当前区域：{session.currentMap.name}</p>
          </div>
          <div className="map-grid">
            {gameContent.mapDefinitions.map((map) => {
              const unlocked = session.state.unlockedMapIds.includes(map.id);
              const isCurrent = map.id === session.currentMap.id;
              const cleared = session.state.lifetime.clearedMapIds.includes(map.id);

              return (
                <article key={map.id} className={`map-card ${isCurrent ? "map-card-active" : ""} ${!unlocked ? "map-card-locked" : ""}`}>
                  <div className="map-card-top">
                    <div>
                      <h3>{map.name}</h3>
                      <p>{map.theme}</p>
                    </div>
                    <span>{cleared ? "已通关" : "未通关"}</span>
                  </div>
                  <p>{map.description}</p>
                  <button
                    className="secondary-button"
                    disabled={!unlocked || isCurrent}
                    onClick={() => session.travelToMap(map.id)}
                  >
                    {isCurrent ? "当前区域" : unlocked ? "切换远征" : "未解锁"}
                  </button>
                </article>
              );
            })}
          </div>

          {session.partyIssues.length > 0 && (
            <div className="warning-list section-gap">
              {session.partyIssues.map((issue) => (
                <p key={issue}>{issue}</p>
              ))}
            </div>
          )}

          <div className="exploration-panel section-gap">
            <div className="grid-board">
              {session.currentMap.layout.map((row, y) =>
                row.split("").map((symbol, x) => {
                  const tileKey = `${x},${y}`;
                  const active =
                    session.state.exploration.position.x === x &&
                    session.state.exploration.position.y === y;

                  return (
                    <div
                      key={tileKey}
                      className={getTileClass(symbol, active, visited.has(tileKey))}
                    >
                      {active ? "队" : visited.has(tileKey) && symbol !== "." ? symbol : ""}
                    </div>
                  );
                }),
              )}
            </div>
            <div className="move-controls">
              <button className="secondary-button" onClick={() => session.moveExplorer(0, -1)}>
                向上
              </button>
              <div className="move-row">
                <button className="secondary-button" onClick={() => session.moveExplorer(-1, 0)}>
                  向左
                </button>
                <button className="secondary-button" onClick={() => session.moveExplorer(1, 0)}>
                  向右
                </button>
              </div>
              <button className="secondary-button" onClick={() => session.moveExplorer(0, 1)}>
                向下
              </button>
            </div>
          </div>
        </section>

        {session.state.battle && (
          <section className="panel battle-live-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Battle</p>
                <h2>时间轴战斗</h2>
              </div>
              <p>
                {session.state.battle.activeUnitId
                  ? `当前行动者：${[...session.state.battle.playerUnits, ...session.state.battle.enemyUnits].find((unit) => unit.unitId === session.state.battle?.activeUnitId)?.name ?? "-"}`
                  : "等待结算"}
              </p>
            </div>
            <div className="battle-layout">
              <div>
                <h3>我方</h3>
                <div className="monster-grid">
                  {session.state.battle.playerUnits.map((unit) => (
                    <article key={unit.unitId} className="monster-card battle-unit-card">
                      <h3>{unit.icon} {unit.name}</h3>
                      <p>HP {unit.currentHealth} / {unit.maxHealth}</p>
                      <p>ATK {unit.attack} · DEF {unit.defense} · SPD {unit.speed}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div>
                <h3>敌方</h3>
                <div className="monster-grid">
                  {session.state.battle.enemyUnits.map((unit) => (
                    <article key={unit.unitId} className="monster-card battle-unit-card">
                      <h3>{unit.icon} {unit.name}</h3>
                      <p>HP {unit.currentHealth} / {unit.maxHealth}</p>
                      <p>ATK {unit.attack} · DEF {unit.defense} · SPD {unit.speed}</p>
                      <button
                        className="primary-button"
                        disabled={unit.currentHealth <= 0 || session.state.battle?.phase !== "player_turn"}
                        onClick={() => session.attackTarget(unit.unitId)}
                      >
                        普攻目标
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div className="battle-log section-gap">
              {session.state.battle.log.map((line, index) => (
                <p key={`${index}-${line}`}>{line}</p>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Roster</p>
              <h2>冒险者与岗位</h2>
            </div>
            <p>同一名冒险者只能服务一条主线职责。</p>
          </div>
          <div className="monster-grid">
            {session.roster.map(({ adventurer, definition, stats }) => (
              <article
                key={adventurer.instanceId}
                className="monster-card"
                style={{ borderColor: definition.visuals.accent }}
              >
                <div className="monster-card-top">
                  <div>
                    <h3>{definition.visuals.emoji} {definition.name}</h3>
                    <p>Lv.{adventurer.level} · {definition.title}</p>
                  </div>
                  <span className="rarity-pill">{adventurer.assignment}</span>
                </div>
                <p className="monster-copy">{definition.role}</p>
                <div className="monster-stats">
                  <span>HP {stats.maxHealth}</span>
                  <span>ATK {stats.attack}</span>
                  <span>DEF {stats.defense}</span>
                  <span>SPD {stats.speed}</span>
                </div>
                <div className="labor-stats">
                  <span>锻造 {definition.utilityProfile.smithing}</span>
                  <span>营业 {definition.utilityProfile.sales}</span>
                  <span>侦查 {definition.utilityProfile.scouting}</span>
                </div>
                <div className="assignment-buttons">
                  <button
                    className={adventurer.assignment === "party" ? "active-tag" : ""}
                    onClick={() => session.assignAdventurer(adventurer.instanceId, "party")}
                  >
                    远征队
                  </button>
                  <button
                    className={adventurer.assignment === "smithy" ? "active-tag" : ""}
                    onClick={() => session.assignAdventurer(adventurer.instanceId, "smithy")}
                  >
                    工坊
                  </button>
                  <button
                    className={adventurer.assignment === "counter" ? "active-tag" : ""}
                    onClick={() => session.assignAdventurer(adventurer.instanceId, "counter")}
                  >
                    柜台
                  </button>
                  <button
                    className={adventurer.assignment === "rest" ? "active-tag" : ""}
                    onClick={() => session.assignAdventurer(adventurer.instanceId, "rest")}
                  >
                    休整
                  </button>
                </div>
                <div className="equip-grid">
                  {(["weapon", "armor", "accessory"] as EquipmentSlot[]).map((slot) => {
                    const equippedItemId = adventurer.equipment[slot];
                    const options = getEquipmentOptions(
                      gameContent.itemDefinitions,
                      session.state.inventory,
                      slot,
                      equippedItemId,
                    );

                    return (
                      <label key={slot} className="equip-field">
                        <span>{slot}</span>
                        <select
                          value={equippedItemId ?? ""}
                          onChange={(event) =>
                            session.equipItem(adventurer.instanceId, slot, event.target.value)
                          }
                        >
                          <option value="">空槽</option>
                          {options.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h2>仓库素材</h2>
            </div>
          </div>
          <div className="inventory-list">
            {session.inventoryEntries.map((entry) => (
              <article key={entry.itemId} className="inventory-row">
                <div>
                  <h3>{gameContent.itemDefinitionsById[entry.itemId].name}</h3>
                  <p>{gameContent.itemDefinitionsById[entry.itemId].description}</p>
                </div>
                <div className="inventory-row-actions">
                  <span>x{entry.quantity}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Quest Board</p>
              <h2>主线与订单</h2>
            </div>
          </div>
          <div className="quest-list">
            {session.quests.map(({ quest, claimed, completable }) => (
              <article key={quest.id} className="quest-card">
                <div className="quest-top">
                  <h3>{quest.name}</h3>
                  <span className="rarity-pill">{quest.type}</span>
                </div>
                <p>{quest.description}</p>
                <p>
                  需求：{quest.requirements.map((requirement) => formatQuestRequirement(requirement)).join(" / ")}
                </p>
                <p>
                  奖励：{quest.rewards.gold} 金币
                  {quest.rewards.items.length > 0
                    ? ` + ${formatInventoryEntries(quest.rewards.items)}`
                    : ""}
                </p>
                <button
                  className="primary-button"
                  disabled={claimed || !completable}
                  onClick={() => session.claimQuest(quest.id)}
                >
                  {claimed ? "已完成" : completable ? "提交任务" : "条件未满足"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>近期动态</h2>
            </div>
          </div>
          <div className="activity-feed">
            {session.state.recentActivities.map((activity, index) => (
              <p key={`${index}-${activity}`}>{activity}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
