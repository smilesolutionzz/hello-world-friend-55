import { Badge } from "@/components/ui/badge";
import { LEGAL_VERSIONS, type LegalDoc } from "@/lib/legalVersions";

interface Props {
  doc: LegalDoc;
  className?: string;
}

export function LegalVersionBadge({ doc, className = "" }: Props) {
  const v = LEGAL_VERSIONS[doc];
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      <Badge variant="outline" className="font-mono text-[10px]">
        v{v.version}
      </Badge>
      <span className="text-muted-foreground">최종 수정일: {v.lastUpdated}</span>
    </div>
  );
}

export default LegalVersionBadge;
