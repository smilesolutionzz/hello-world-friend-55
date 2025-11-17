import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">프로필 페이지입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
