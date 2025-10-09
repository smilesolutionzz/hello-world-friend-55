import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceAnalysisFormProps {
  onComplete: (results: any) => void;
}

export const InsuranceAnalysisForm = ({ onComplete }: InsuranceAnalysisFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      return isImage || isPDF;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 또는 PDF 파일만 업로드 가능합니다.",
        variant: "destructive"
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeInsurance = async () => {
    if (files.length === 0) {
      toast({
        title: "파일을 선택해주세요",
        description: "분석할 보험 증권을 업로드해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert files to base64
      const filePromises = files.map(file => {
        return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve({
              name: file.name,
              type: file.type,
              data: base64.split(',')[1] // Remove data:image/png;base64, prefix
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const filesData = await Promise.all(filePromises);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('analyze-insurance-coverage', {
        body: { files: filesData }
      });

      if (error) throw error;

      toast({
        title: "분석 완료",
        description: "보험 보장 분석이 완료되었습니다.",
      });

      onComplete(data);
    } catch (error) {
      console.error('Insurance analysis error:', error);
      toast({
        title: "분석 실패",
        description: "보험 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">보험 증권 업로드</CardTitle>
          <p className="text-muted-foreground">
            가족의 보험 증권 사진 또는 PDF를 업로드하면, AI가 보장 내용을 분석해드립니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="insurance-upload"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="insurance-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">증권 파일을 선택하거나 드래그하세요</p>
              <p className="text-sm text-muted-foreground">
                이미지(JPG, PNG) 또는 PDF 파일 지원
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">업로드된 파일 ({files.length}개)</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={analyzeInsurance}
            disabled={isAnalyzing || files.length === 0}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI 분석 중...
              </>
            ) : (
              '보장 분석 시작'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">📋 분석 항목</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-primary">부모 보장</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 뇌출혈 / 뇌혈관질환</li>
                <li>• 허혈성심장 / 급성심근경색</li>
                <li>• 암 / 유사암 / 고액암</li>
                <li>• 재해 / 후유장해 / 실손</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-primary">자녀 보장</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 선천성질환 / 입원일당 / 수술비</li>
                <li>• 아동암 / 소아백혈병</li>
                <li>• 상해후유장해 / 골절</li>
                <li>• 응급실비 / 통원비 / 감염질환</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
