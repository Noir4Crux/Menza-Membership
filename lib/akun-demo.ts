import type { SessionRole } from "@/lib/session";

type DemoAccount = {
  role: SessionRole;
  id: string;
};

export const akunDemo: Record<string, DemoAccount> = {
  "faiztbb123@gmail.com": { role: "member", id: "MBR002" },
  "lovaya123@gmail.com": { role: "administrator", id: "ADM001" },
  "rafising123@gmail.com": { role: "barber", id: "BRB001" },
  "zahra123@gmail.com": { role: "owner", id: "OWN001" },
  "amiflow123@gmail.com": { role: "supplier", id: "SUP001" },
};
