import React from "react";
import {type GameState,type Action } from "../store";
import { getEncounterById } from "../systems/encounter";
import { MONSTERS } from "../data/monsters";
import {  createMonsterInstance } from "../systems/capture";

export function EncounterModal(props: {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  const { state, dispatch } = props;
  const id = state.pendingEncounterId;
  if (!id) return null;

  const enc = getEncounterById(state, id);
  if (!enc) return null;

  const tmpl = MONSTERS[enc.templateId];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
      onClick={() => dispatch({ type: "ENCOUNTER_CLOSE" })}
    >
      <div
        style={{
          width: 320,
          background: "#fff",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>遭遇！</div>
        <div style={{ marginBottom: 8 }}>
          你遇到了：<b>{tmpl?.name ?? enc.templateId}</b>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              // MVP：必定成功捕捉；闪光后面再做概率
              const inst = createMonsterInstance(enc.templateId, false);
              dispatch({ type: "CAPTURE_SUCCESS", encounterId: enc.id, monster: inst });
            }}
          >
            捕捉
          </button>

          <button onClick={() => dispatch({ type: "START_BATTLE", encounterId: enc.id })}>
            战斗（占位）
          </button>

          <button onClick={() => dispatch({ type: "ENCOUNTER_CLOSE" })}>离开</button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          MVP：捕捉默认成功；战斗系统下一步接入时间轴引擎。
        </div>
      </div>
    </div>
  );
}
