import { Button } from "@/components/ui/button";
import { Sparkles, Home, Clock, BookOpen, MessageCircle, Info } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="text-brand-gradient">AIH Pro</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-1">
        <Button variant="ghost" className="btn-ghost">
          <Home className="w-4 h-4 mr-2" />
          홈
        </Button>
        <Button variant="ghost" className="btn-ghost">
          <Clock className="w-4 h-4 mr-2" />
          3분 테스트
        </Button>
        <Button variant="ghost" className="btn-ghost">
          <BookOpen className="w-4 h-4 mr-2" />
          관찰일지
        </Button>
        <Button variant="ghost" className="btn-ghost">
          <MessageCircle className="w-4 h-4 mr-2" />
          실시간상담
        </Button>
        <Button variant="ghost" className="btn-ghost">
          <Info className="w-4 h-4 mr-2" />
          About
        </Button>
      </div>

      {/* Login Button */}
      <Button className="btn-brand">
        로그인
      </Button>
    </nav>
  );
};

export default Navigation;