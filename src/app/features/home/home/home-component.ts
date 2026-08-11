import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Mood {
  label: string;
  value: number;
}

interface AuthorQuote {
  text: string;
  author: string;
  era: string;
  initial: string;
}

interface Era {
  label: string;
  count: string;
  num: string;
}

interface AnalysisResult {
  genre: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  verdict: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  // ─── Nav / Router ─────────────────────────────────────────────────────────
  constructor(private router: Router, private cdr: ChangeDetectorRef, private http: HttpClient) { }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  scrollToTop(event?: Event): void {
    event?.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

@ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

ngAfterViewInit() {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        this.videoEl.nativeElement.pause();
      }
    },
    { threshold: 0.25 }
  );
  observer.observe(this.videoEl.nativeElement);
}

  scrollToExplore(event?: Event): void {
    event?.preventDefault();
    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToAI(event?: Event): void {
    event?.preventDefault();
    document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── Time Wheel ───────────────────────────────────────────────────────────
  wheelTicks: number[] = Array.from({ length: 36 }, (_, i) => i * 10);

  private eras: Era[] = [
    { label: 'العصر الكلاسيكي', count: 'روايات خالدة', num: '128 رواية' },
    { label: 'العصر الفيكتوري', count: 'حكايات إنجليزية خالدة', num: '99 رواية' },
    { label: 'العصر الحديث', count: 'أفكار جديدة.. عوالم متجددة', num: '245 رواية' },
    { label: 'البوابات المفقودة', count: 'كنوز مخفية تنتظر من يكشفها', num: '61 رواية' },
  ];

  activeEra = this.eras[0].label;
  activeCount = this.eras[0].count;
  activeNum = this.eras[0].num;

  private eraInterval: ReturnType<typeof setInterval> | null = null;
  private currentEraIdx = 0;

  private startEraRotation(): void {
    this.eraInterval = setInterval(() => {
      this.currentEraIdx = (this.currentEraIdx + 1) % this.eras.length;
      const era = this.eras[this.currentEraIdx];
      this.activeEra = era.label;
      this.activeCount = era.count;
      this.activeNum = era.num;
    }, 3000);
  }

  // ─── Mood Lab ─────────────────────────────────────────────────────────────
  moods: Mood[] = [
    { label: 'غموض', value: 80 },
    { label: 'دراما', value: 60 },
    { label: 'رعب', value: 20 },
    { label: 'رومانسي', value: 5 },
    { label: 'خيال علمي', value: 3 },
    { label: 'فلسفة', value: 45 },
    { label: 'تاريخي', value: 8 },
  ];

  toggleMood(mood: Mood): void {
    mood.value = mood.value < 33 ? 33 : mood.value < 66 ? 66 : mood.value < 100 ? 100 : 0;
  }

  get radarPoints(): string {
    const vals = this.moods.slice(0, 6).map(m => m.value / 100);
    const vertices = [
      [100, 20], [170, 60], [170, 140],
      [100, 180], [30, 140], [30, 60],
    ];
    const cx = 100, cy = 100;
    return vertices.map(([x, y], i) => {
      const nx = cx + (x - cx) * vals[i];
      const ny = cy + (y - cy) * vals[i];
      return `${nx},${ny}`;
    }).join(' ');
  }

  // ─── Author Quotes ─────────────────────────────────────────────────────────
  authorQuotes: AuthorQuote[] = [
    { text: 'الجمال سينقذ العالم.', author: 'فيودور دوستويفسكي', era: 'الأدب الروسي · ١٨٦٩', initial: 'د' },
    { text: 'إذا لم تزد شيئًا على الدنيا، كنت أنت زائدًا عليها.', author: 'مصطفى صادق الرافعي', era: 'الأدب العربي الكلاسيكي', initial: 'ر' },
    { text: 'في حياة كل إنسان لحظة لا تعود الحياة بعدها كما كانت قبلها.', author: 'أحمد خالد توفيق', era: 'خواطر', initial: 'ف'},
    { text: 'عليَّ أن أحيا بلا أحلام.',  author: 'أحمد خالد توفيق', era: 'يوتوبيا', initial: 'ع'},
    { text: 'كل الناس يعيشون حياتهم، لكن الكُتّاب يعيشونها مرتين.', author: 'نجيب محفوظ', era: 'نوبل الآداب · ١٩٨٨', initial: 'ن' },
    {text: 'من لديه سبب يعيش من أجله، يستطيع تحمل أي كيف.', author: 'فريدريش نيتشه', era: 'الفلسفة الألمانية',initial: 'ن'},
  ];

  // ─── AI Analyzer ──────────────────────────────────────────────────────────
  novelTitle = '';
  novelDescription = '';
  isAnalyzing = false;
  analysisResult: AnalysisResult | null = null;
  analysisError = '';

  scoreOffset(score: number): number {
    return 188.5 - (188.5 * score / 100);
  }

  async analyzeNovel(): Promise<void> {

    if (!this.novelTitle.trim() || !this.novelDescription.trim()) {
      this.analysisError = 'اكتب عنوان الرواية ووصفها أولاً.';
      return;
    }

    this.isAnalyzing = true;
    this.analysisResult = null;
    this.analysisError = '';

    try {
      const result = await fetch(`${environment.apiUrl}/AIHome/analyze-novel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelTitle: this.novelTitle,
          novelDescription: this.novelDescription
        })
      });

      const data = await result.json();

      if (!result.ok) {
        this.analysisError = data?.message || 'حدث خطأ أثناء التحليل.';
        return;
      }

      this.analysisResult = data as AnalysisResult;
      this.cdr.detectChanges();

    } catch (err) {
      console.error(err);
      this.analysisError = 'فشل الاتصال بالخادم أو تعذّر قراءة الرد.';
      this.cdr.detectChanges();
    } finally {
      this.isAnalyzing = false;
      this.cdr.detectChanges();
    }

  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.startEraRotation();
  }

  ngOnDestroy(): void {
    if (this.eraInterval) clearInterval(this.eraInterval);
  }
}