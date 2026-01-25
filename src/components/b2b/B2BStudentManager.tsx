import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  X,
  Save,
  User,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastAssessmentDate?: string;
  assessmentScores?: Record<string, number>;
  notes?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface B2BStudentManagerProps {
  onSelectStudent?: (student: Student) => void;
  onRunAgent?: (student: Student, agentType: string) => void;
  onGenerateReport?: (student: Student) => void;
}

export const B2BStudentManager: React.FC<B2BStudentManagerProps> = ({
  onSelectStudent,
  onRunAgent,
  onGenerateReport
}) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: '김민준',
      age: 10,
      grade: '초4',
      parentName: '김영희',
      parentEmail: 'kim@example.com',
      parentPhone: '010-1234-5678',
      riskLevel: 'low',
      lastAssessmentDate: '2025-01-20',
      assessmentScores: { development: 85, emotion: 78, social: 82 },
      notes: '수학에 흥미가 많음',
      createdAt: '2025-01-01',
      status: 'active'
    },
    {
      id: '2',
      name: '최수아',
      age: 8,
      grade: '초2',
      parentName: '최민수',
      parentEmail: 'choi@example.com',
      parentPhone: '010-2345-6789',
      riskLevel: 'medium',
      lastAssessmentDate: '2025-01-18',
      assessmentScores: { development: 72, emotion: 65, social: 78 },
      notes: '최근 집중력 저하 관찰됨',
      createdAt: '2025-01-05',
      status: 'active'
    },
    {
      id: '3',
      name: '정우진',
      age: 12,
      grade: '초6',
      parentName: '정민정',
      parentEmail: 'jung@example.com',
      parentPhone: '010-3456-7890',
      riskLevel: 'high',
      lastAssessmentDate: '2025-01-22',
      assessmentScores: { development: 60, emotion: 55, social: 68 },
      notes: '또래 관계 어려움 호소',
      createdAt: '2025-01-10',
      status: 'active'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    age: 10,
    grade: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    notes: '',
    riskLevel: 'low',
    status: 'active'
  });

  const filteredStudents = students.filter(s =>
    s.name.includes(searchTerm) || 
    s.parentName.includes(searchTerm) ||
    s.grade.includes(searchTerm)
  );

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    highRisk: students.filter(s => s.riskLevel === 'high').length,
    recentAssessment: students.filter(s => {
      if (!s.lastAssessmentDate) return false;
      const lastDate = new Date(s.lastAssessmentDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastDate >= weekAgo;
    }).length
  };

  const handleAddStudent = () => {
    if (!formData.name || !formData.parentEmail) {
      toast({
        title: '필수 정보를 입력하세요',
        description: '학생 이름과 학부모 이메일은 필수입니다.',
        variant: 'destructive'
      });
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name!,
      age: formData.age || 10,
      grade: formData.grade || '',
      parentName: formData.parentName || '',
      parentEmail: formData.parentEmail!,
      parentPhone: formData.parentPhone || '',
      riskLevel: formData.riskLevel as 'low' | 'medium' | 'high' || 'low',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setStudents(prev => [newStudent, ...prev]);
    setShowAddModal(false);
    resetForm();
    toast({
      title: '학생 등록 완료',
      description: `${newStudent.name} 학생이 등록되었습니다.`,
    });
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    setStudents(prev => prev.map(s =>
      s.id === editingStudent.id
        ? { ...s, ...formData }
        : s
    ));
    setEditingStudent(null);
    resetForm();
    toast({
      title: '학생 정보 수정 완료',
      description: '학생 정보가 업데이트되었습니다.',
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    toast({
      title: '학생 삭제 완료',
      description: '학생 정보가 삭제되었습니다.',
    });
  };

  const handleBulkDelete = () => {
    setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
    setSelectedStudents([]);
    toast({
      title: '일괄 삭제 완료',
      description: `${selectedStudents.length}명의 학생이 삭제되었습니다.`,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: 10,
      grade: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      notes: '',
      riskLevel: 'low',
      status: 'active'
    });
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      age: student.age,
      grade: student.grade,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      notes: student.notes,
      riskLevel: student.riskLevel,
      status: student.status
    });
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-0"><AlertTriangle className="w-3 h-3 mr-1" />위험</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0"><Clock className="w-3 h-3 mr-1" />관심</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-0"><CheckCircle className="w-3 h-3 mr-1" />양호</Badge>;
    }
  };

  return (
    <>
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden backdrop-blur-xl">
        <CardHeader className="border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-violet-400" />
                학생 관리
              </CardTitle>
              <p className="text-slate-400 text-sm mt-1">학생 정보를 등록하고 AI 분석을 실행하세요</p>
            </div>
            <div className="flex gap-3">
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  선택 삭제 ({selectedStudents.length})
                </Button>
              )}
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                학생 등록
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-slate-400 text-sm">전체 학생</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <p className="text-slate-400 text-sm">활성 학생</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.highRisk}</span>
              </div>
              <p className="text-slate-400 text-sm">위험 학생</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.recentAssessment}</span>
              </div>
              <p className="text-slate-400 text-sm">최근 검사</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="학생 또는 학부모 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="bg-slate-800/30 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-sm text-slate-400">
              <div className="col-span-1">
                <Checkbox
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onCheckedChange={selectAllStudents}
                />
              </div>
              <span className="col-span-3">학생</span>
              <span className="col-span-2">학년</span>
              <span className="col-span-2">위험도</span>
              <span className="col-span-2">최근 검사</span>
              <span className="col-span-2">액션</span>
            </div>

            <AnimatePresence>
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors items-center cursor-pointer"
                  onClick={() => {
                    setSelectedStudentDetail(student);
                    onSelectStudent?.(student);
                  }}
                >
                  <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleSelectStudent(student.id)}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.parentName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white">{student.grade}</span>
                    <span className="text-slate-500 text-sm ml-1">({student.age}세)</span>
                  </div>
                  <div className="col-span-2">
                    {getRiskBadge(student.riskLevel)}
                  </div>
                  <div className="col-span-2">
                    {student.lastAssessmentDate ? (
                      <span className="text-slate-400 text-sm">
                        {new Date(student.lastAssessmentDate).toLocaleDateString('ko-KR')}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-sm">미검사</span>
                    )}
                  </div>
                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => onRunAgent?.(student, 'psychology')}
                          className="text-white hover:bg-slate-800"
                        >
                          <Brain className="w-4 h-4 mr-2 text-violet-400" />
                          AI 분석 실행
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onGenerateReport?.(student)}
                          className="text-white hover:bg-slate-800"
                        >
                          <FileText className="w-4 h-4 mr-2 text-pink-400" />
                          리포트 생성
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditModal(student)}
                          className="text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredStudents.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">등록된 학생이 없습니다</p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 학생 등록하기
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Student Modal */}
      <Dialog open={showAddModal || !!editingStudent} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setEditingStudent(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              {editingStudent ? '학생 정보 수정' : '학생 등록'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              학생과 학부모 정보를 입력해주세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">학생 이름 *</Label>
                <Input
                  placeholder="김민준"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">나이</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 10 })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">학년</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="학년 선택" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['유아', '초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'].map(g => (
                    <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
              <p className="text-sm text-slate-500 mb-3">학부모 정보</p>
            </div>

            <div>
              <Label className="text-slate-300">학부모 이름</Label>
              <Input
                placeholder="김영희"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">학부모 이메일 *</Label>
              <Input
                type="email"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">학부모 연락처</Label>
              <Input
                placeholder="010-1234-5678"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">위험도</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) => setFormData({ ...formData, riskLevel: value as 'low' | 'medium' | 'high' })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low" className="text-white">양호</SelectItem>
                  <SelectItem value="medium" className="text-white">관심</SelectItem>
                  <SelectItem value="high" className="text-white">위험</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">메모</Label>
              <Textarea
                placeholder="학생에 대한 특이사항이나 메모..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingStudent(null);
                resetForm();
              }}
              className="flex-1 border-slate-700"
            >
              취소
            </Button>
            <Button
              onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingStudent ? '수정 완료' : '등록하기'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudentDetail} onOpenChange={() => setSelectedStudentDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              학생 상세 정보
            </DialogTitle>
          </DialogHeader>

          {selectedStudentDetail && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedStudentDetail.name}</h3>
                  <p className="text-slate-400">{selectedStudentDetail.grade} ({selectedStudentDetail.age}세)</p>
                  {getRiskBadge(selectedStudentDetail.riskLevel)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-500 mb-1">학부모</p>
                  <p className="text-white">{selectedStudentDetail.parentName}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-500 mb-1">이메일</p>
                  <p className="text-white text-sm truncate">{selectedStudentDetail.parentEmail}</p>
                </div>
              </div>

              {selectedStudentDetail.assessmentScores && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-3">최근 검사 점수</p>
                  <div className="space-y-2">
                    {Object.entries(selectedStudentDetail.assessmentScores).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-white font-medium w-8">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudentDetail.notes && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-2">메모</p>
                  <p className="text-white">{selectedStudentDetail.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    onRunAgent?.(selectedStudentDetail, 'psychology');
                    setSelectedStudentDetail(null);
                  }}
                  className="flex-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI 분석
                </Button>
                <Button
                  onClick={() => {
                    onGenerateReport?.(selectedStudentDetail);
                    setSelectedStudentDetail(null);
                  }}
                  className="flex-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  리포트 생성
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default B2BStudentManager;
