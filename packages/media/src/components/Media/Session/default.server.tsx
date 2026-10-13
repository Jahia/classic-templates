import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useT } from "../../../lib/i18n.js";
import { readString } from "../../../lib/props.js";
import type { Props, SpeakerProps } from "./types.js";
import { SessionCard, SessionCompact, SessionFull } from "./views.js";

// "fullPage" is used by the classic-templates main-resource template at the session's own URL;
// "compact" by the agenda; "card" by content lists and a person's page; the default view is the card.
const card = (props: Props) => <SessionCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "ctmd:session", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:session", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:session", name: "compact", displayName: "Agenda row" },
  (props: Props) => <SessionCompact props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:session", name: "fullPage", displayName: "Full page" },
  (props: Props) => <SessionFull props={props} />,
);

// A speaker is shown by its session (name, role, portrait come from the person). This view is what
// editors see when they open the session's content: the person and the part they play.
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:sessionSpeaker", displayName: "Speaker" },
  ({ person, speakerRole }: SpeakerProps) => {
    const t = useT();
    const name = person ? readString(person, "jcr:title") : undefined;
    const part = speakerRole ? t(`session.role.${speakerRole}`) : undefined;
    return (
      <p data-testid="ctmd-session-speaker">
        {name ?? t("item.noTitle")}
        {part && ` (${part})`}
      </p>
    );
  },
);
