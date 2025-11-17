import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">설정 페이지입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
