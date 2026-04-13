import { useGameSession } from "./application/useGameSession";
import { gameContent } from "./content";
import { canCraftRecipe } from "./domain/crafting";
import { deriveMonsterStats } from "./domain/monster-rules";
import { getAssignmentPower } from "./domain/selectors";
import {
  formatAssignment,
  formatInventoryEntries,
  formatPercent,
  formatQuestRequirement,
} from "./ui/formatters";

function App() {
  const session = useGameSession();
  const idlePower = getAssignmentPower(
    session.state,
    "idle",
    session.currentMap.id,
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Monster Agency</p>
          <h1>纯前端事务所原型</h1>
          <p className="hero-copy">
            用战斗、放置、制作与经营把同一批怪物串成一条资源循环。
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={session.settleIdleNow}>
            立即结算放置收益
          </button>
          <button className="ghost-button" onClick={session.resetProgress}>
            重置存档
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>金币储备</span>
          <strong>{session.state.gold}</strong>
        </article>
        <article className="stat-card">
          <span>已拥有怪物</span>
          <strong>{session.state.monsters.length}</strong>
        </article>
        <article className="stat-card">
          <span>已解锁地图</span>
          <strong>{session.unlockedMaps.length}</strong>
        </article>
        <article className="stat-card">
          <span>当前地图放置力</span>
          <strong>{idlePower}</strong>
        </article>
        <article className="stat-card">
          <span>制作岗位总力</span>
          <strong>{session.craftingPower}</strong>
        </article>
        <article className="stat-card">
          <span>经营岗位总力</span>
          <strong>{session.storePower}</strong>
        </article>
      </section>

      {session.idleReport && (
        <section className="notice notice-success">
          <div>
            <h2>放置结算</h2>
            {session.idleReport.settledTicks > 0 ? (
              <p>
                过去 {session.idleReport.elapsedHours.toFixed(1)} 小时共回收：
                {formatInventoryEntries(session.idleReport.itemsCollected)}
              </p>
            ) : (
              <p>还没有攒满新的结算周期，稍后再回来查看也可以。</p>
            )}
          </div>
          <button className="ghost-button" onClick={session.dismissIdleReport}>
            关闭
          </button>
        </section>
      )}

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
              <p className="eyebrow">Explore</p>
              <h2>地图与出击</h2>
            </div>
            <button
              className="primary-button"
              onClick={session.runEncounter}
              disabled={!session.lineupValidation.valid}
            >
              开始探索战斗
            </button>
          </div>

          <div className="map-grid">
            {gameContent.mapDefinitions.map((map) => {
              const unlocked = session.state.unlockedMapIds.includes(map.id);
              const wins = session.state.mapProgress[map.id]?.wins ?? 0;
              const isCurrent = map.id === session.currentMap.id;

              return (
                <article
                  key={map.id}
                  className={`map-card ${isCurrent ? "map-card-active" : ""} ${
                    !unlocked ? "map-card-locked" : ""
                  }`}
                >
                  <div className="map-card-top">
                    <div>
                      <h3>{map.name}</h3>
                      <p>{map.theme}</p>
                    </div>
                    <span>难度 {map.difficulty}</span>
                  </div>
                  <p>{map.description}</p>
                  <p>战斗胜场：{wins}</p>
                  <p>放置掉落：{formatInventoryEntries(map.idleDropTable)}</p>
                  <button
                    className="secondary-button"
                    disabled={!unlocked || isCurrent}
                    onClick={() => session.travelToMap(map.id)}
                  >
                    {isCurrent ? "当前地图" : unlocked ? "前往地图" : "未解锁"}
                  </button>
                </article>
              );
            })}
          </div>

          {!session.lineupValidation.valid && (
            <div className="warning-list">
              {session.lineupValidation.issues.map((issue) => (
                <p key={issue}>{issue}</p>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Roster</p>
              <h2>怪物岗位与编队</h2>
            </div>
            <p>
              当前编队 {session.state.activeLineup.length} /{" "}
              {session.currentMap.deploymentLimit}
            </p>
          </div>

          <div className="monster-grid">
            {session.roster.map(({ monster, template }) => {
              const stats = deriveMonsterStats(monster, template);
              const inLineup = session.state.activeLineup.includes(monster.instanceId);
              const canWorkOnCurrentMap = template.allowedMapIds.includes(
                session.currentMap.id,
              );

              return (
                <article
                  key={monster.instanceId}
                  className="monster-card"
                  style={{ borderColor: template.visuals.accent }}
                >
                  <div className="monster-card-top">
                    <div>
                      <h3>
                        <span>{template.visuals.emoji}</span> {template.name}
                      </h3>
                      <p>Lv.{monster.level} · {template.species}</p>
                    </div>
                    <span className="rarity-pill">{template.rarity}</span>
                  </div>
                  <p className="monster-copy">{formatAssignment(monster)}</p>
                  <div className="monster-stats">
                    <span>HP {stats.maxHealth}</span>
                    <span>ATK {stats.attack}</span>
                    <span>DEF {stats.defense}</span>
                    <span>SPD {stats.speed}</span>
                  </div>
                  <div className="labor-stats">
                    <span>放置 {template.laborProfile.farming}</span>
                    <span>制作 {template.laborProfile.crafting}</span>
                    <span>经营 {template.laborProfile.store}</span>
                  </div>
                  <div className="assignment-buttons">
                    <button
                      className={
                        monster.currentAssignment.type === "combat" ? "active-tag" : ""
                      }
                      disabled={!canWorkOnCurrentMap}
                      onClick={() =>
                        session.updateMonsterAssignment(monster.instanceId, "combat")
                      }
                    >
                      战斗
                    </button>
                    <button
                      className={
                        monster.currentAssignment.type === "idle" ? "active-tag" : ""
                      }
                      disabled={!canWorkOnCurrentMap}
                      onClick={() =>
                        session.updateMonsterAssignment(monster.instanceId, "idle")
                      }
                    >
                      放置
                    </button>
                    <button
                      className={
                        monster.currentAssignment.type === "crafting" ? "active-tag" : ""
                      }
                      onClick={() =>
                        session.updateMonsterAssignment(monster.instanceId, "crafting")
                      }
                    >
                      制作
                    </button>
                    <button
                      className={
                        monster.currentAssignment.type === "store" ? "active-tag" : ""
                      }
                      onClick={() =>
                        session.updateMonsterAssignment(monster.instanceId, "store")
                      }
                    >
                      经营
                    </button>
                  </div>
                  <button
                    className="secondary-button"
                    disabled={
                      !canWorkOnCurrentMap &&
                      monster.currentAssignment.type === "combat"
                    }
                    onClick={() => session.toggleLineup(monster.instanceId)}
                  >
                    {inLineup ? "移出编队" : "加入编队"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Crafting</p>
              <h2>制作链路</h2>
            </div>
            <p>当前制作加成：+{Math.max(0, Math.floor(session.craftingPower / 6))}</p>
          </div>

          <div className="recipe-grid">
            {gameContent.recipeDefinitions.map((recipe) => (
              <article key={recipe.id} className="recipe-card">
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
                <p>消耗：{formatInventoryEntries(recipe.inputs)}</p>
                <p>
                  产出：{gameContent.itemDefinitionsById[recipe.output.itemId].name} x
                  {recipe.output.quantity}
                </p>
                <button
                  className="primary-button"
                  disabled={!canCraftRecipe(session.state, recipe)}
                  onClick={() => session.craft(recipe.id)}
                >
                  立即制作
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Economy</p>
              <h2>仓库与出售</h2>
            </div>
            <p>经营溢价：{formatPercent(Math.min(0.45, session.storePower * 0.03))}</p>
          </div>

          <div className="inventory-list">
            {session.inventoryEntries.map((entry) => {
              const item = gameContent.itemDefinitionsById[entry.itemId];
              return (
                <article key={entry.itemId} className="inventory-row">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="inventory-row-actions">
                    <span>x{entry.quantity}</span>
                    <button
                      className="secondary-button"
                      onClick={() => session.sell(entry.itemId, 1)}
                    >
                      卖出 1 个
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Quests</p>
              <h2>任务板</h2>
            </div>
            <p>主线负责地图推进，支线负责把制作品变现。</p>
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
                  需求：
                  {quest.requirements
                    .map((requirement) => formatQuestRequirement(requirement))
                    .join(" / ")}
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
