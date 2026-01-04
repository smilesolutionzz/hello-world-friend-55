import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, Download, Apple, Smartphone, CheckCircle2, 
  Copy, ExternalLink, Terminal, FileCode, Package,
  AlertCircle, Info, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const AppStoreGuide = () => {
  const navigate = useNavigate();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    toast.success('복사되었습니다!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const iosSteps = [
    {
      id: 'ios-1',
      title: '1. 프로젝트 GitHub Export',
      description: 'Lovable에서 GitHub으로 프로젝트를 내보냅니다.',
      code: null,
      action: 'Export to GitHub 버튼 클릭'
    },
    {
      id: 'ios-2',
      title: '2. 로컬에서 프로젝트 클론',
      description: 'GitHub에서 프로젝트를 로컬로 클론합니다.',
      code: 'git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd YOUR_REPO'
    },
    {
      id: 'ios-3',
      title: '3. 의존성 설치',
      description: 'npm 패키지를 설치합니다.',
      code: 'npm install'
    },
    {
      id: 'ios-4',
      title: '4. iOS 플랫폼 추가',
      description: 'Capacitor iOS 플랫폼을 추가합니다.',
      code: 'npx cap add ios'
    },
    {
      id: 'ios-5',
      title: '5. 빌드 및 동기화',
      description: '프로젝트를 빌드하고 네이티브 코드와 동기화합니다.',
      code: 'npm run build\nnpx cap sync ios'
    },
    {
      id: 'ios-6',
      title: '6. Xcode에서 열기',
      description: 'Xcode에서 iOS 프로젝트를 엽니다.',
      code: 'npx cap open ios'
    },
    {
      id: 'ios-7',
      title: '7. 앱 설정',
      description: 'Xcode에서 Bundle ID, 팀, 서명 설정을 완료합니다.',
      code: null,
      action: 'Xcode → Signing & Capabilities 설정'
    },
    {
      id: 'ios-8',
      title: '8. App Store Connect 설정',
      description: 'App Store Connect에서 앱을 등록합니다.',
      code: null,
      action: 'appstoreconnect.apple.com에서 앱 생성'
    },
    {
      id: 'ios-9',
      title: '9. Archive 및 업로드',
      description: 'Xcode에서 Archive 후 App Store Connect에 업로드합니다.',
      code: null,
      action: 'Product → Archive → Distribute App'
    }
  ];

  const androidSteps = [
    {
      id: 'android-1',
      title: '1. 프로젝트 GitHub Export',
      description: 'Lovable에서 GitHub으로 프로젝트를 내보냅니다.',
      code: null,
      action: 'Export to GitHub 버튼 클릭'
    },
    {
      id: 'android-2',
      title: '2. 로컬에서 프로젝트 클론',
      description: 'GitHub에서 프로젝트를 로컬로 클론합니다.',
      code: 'git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd YOUR_REPO'
    },
    {
      id: 'android-3',
      title: '3. 의존성 설치',
      description: 'npm 패키지를 설치합니다.',
      code: 'npm install'
    },
    {
      id: 'android-4',
      title: '4. Android 플랫폼 추가',
      description: 'Capacitor Android 플랫폼을 추가합니다.',
      code: 'npx cap add android'
    },
    {
      id: 'android-5',
      title: '5. 빌드 및 동기화',
      description: '프로젝트를 빌드하고 네이티브 코드와 동기화합니다.',
      code: 'npm run build\nnpx cap sync android'
    },
    {
      id: 'android-6',
      title: '6. Android Studio에서 열기',
      description: 'Android Studio에서 프로젝트를 엽니다.',
      code: 'npx cap open android'
    },
    {
      id: 'android-7',
      title: '7. 서명 키 생성',
      description: '릴리스용 서명 키를 생성합니다.',
      code: 'keytool -genkey -v -keystore release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000'
    },
    {
      id: 'android-8',
      title: '8. 릴리스 빌드',
      description: 'Android Studio에서 릴리스 APK/AAB를 생성합니다.',
      code: null,
      action: 'Build → Generate Signed Bundle / APK'
    },
    {
      id: 'android-9',
      title: '9. Play Console 업로드',
      description: 'Google Play Console에서 앱을 등록하고 업로드합니다.',
      code: null,
      action: 'play.google.com/console에서 앱 생성 및 업로드'
    }
  ];

  const appInfo = {
    appId: 'app.lovable.c642909236134c6ea94522140ac09444',
    appName: 'hilightpro',
    displayName: 'AI하이라이트PRO',
    description: '3분만에 완성하는 AI 심리분석 및 발달진단',
    category: '건강 및 피트니스 / 의료'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold">앱스토어 출시 가이드</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </nav>

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4">개발자 가이드</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              앱스토어 출시 가이드
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI하이라이트PRO를 iOS App Store와 Google Play Store에 출시하는 방법을 안내합니다.
            </p>
          </div>

          {/* App Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                앱 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">App ID</p>
                  <p className="font-mono text-sm">{appInfo.appId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">앱 이름</p>
                  <p className="font-medium">{appInfo.displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">카테고리</p>
                  <p>{appInfo.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">설명</p>
                  <p>{appInfo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                사전 요구사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Apple className="w-4 h-4" /> iOS 출시용
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• macOS 컴퓨터 (필수)</li>
                    <li>• Xcode 15.0 이상</li>
                    <li>• Apple Developer 계정 (연 $99)</li>
                    <li>• Node.js 18 이상</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4" /> Android 출시용
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Windows/Mac/Linux</li>
                    <li>• Android Studio</li>
                    <li>• Google Play Developer 계정 ($25 일회성)</li>
                    <li>• Node.js 18 이상</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Tabs */}
          <Tabs defaultValue="ios" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iOS (App Store)
              </TabsTrigger>
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Android (Play Store)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-6">
              <div className="space-y-4">
                {iosSteps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          
                          {step.code && (
                            <div className="relative">
                              <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                                <code>{step.code}</code>
                              </pre>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(step.code!, step.id)}
                              >
                                {copiedStep === step.id ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                          
                          {step.action && (
                            <Badge variant="outline" className="mt-2">
                              {step.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="android" className="mt-6">
              <div className="space-y-4">
                {androidSteps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          
                          {step.code && (
                            <div className="relative">
                              <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                                <code>{step.code}</code>
                              </pre>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(step.code!, step.id)}
                              >
                                {copiedStep === step.id ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                          
                          {step.action && (
                            <Badge variant="outline" className="mt-2">
                              {step.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                유용한 리소스
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href="https://capacitorjs.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>Capacitor 공식 문서</span>
                </a>
                <a 
                  href="https://developer.apple.com/app-store/submitting/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>App Store 제출 가이드</span>
                </a>
                <a 
                  href="https://support.google.com/googleplay/android-developer/answer/9859152" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>Google Play 제출 가이드</span>
                </a>
                <a 
                  href="https://docs.lovable.dev/features/mobile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>Lovable 모바일 개발 가이드</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppStoreGuide;
