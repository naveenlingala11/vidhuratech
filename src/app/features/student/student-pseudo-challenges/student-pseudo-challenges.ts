import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeLanguage, PseudoChallengeService } from '../../services/pseudo-challenge';

type StudentFilter = 'ALL' | 'NOT_ATTEMPTED' | 'PASS' | 'FAIL';

interface LanguageOption {
  label: string;
  value: CodeLanguage;
  fileName: string;
  runtime: string;
}

@Component({
  selector: 'app-student-pseudo-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-pseudo-challenges.html',
  styleUrls: ['./student-pseudo-challenges.css'],
})
export class StudentPseudoChallengesComponent implements OnInit {
  loading = false;
  opening = false;
  running = false;

  toast = '';
  search = '';
  statusFilter: StudentFilter = 'ALL';

  challenges: any[] = [];
  selectedChallenge: any = null;
  result: any = null;

  labFullscreen = false;
  language: CodeLanguage = 'PYTHON';
  sourceCode = '';
  showMoreLanguages = false;

  primaryLanguages: LanguageOption[] = [
    { label: 'Python', value: 'PYTHON', fileName: 'main.py', runtime: 'Python 3.14' },
    { label: 'Java', value: 'JAVA', fileName: 'Main.java', runtime: 'OpenJDK 25' },
  ];

  moreLanguages: LanguageOption[] = [
    { label: 'C', value: 'C', fileName: 'main.c', runtime: 'GCC 15' },
    { label: 'C++', value: 'CPP', fileName: 'main.cpp', runtime: 'G++ 15' },
    { label: 'C#', value: 'CSHARP', fileName: 'Program.cs', runtime: '.NET SDK 9' },
    { label: 'F#', value: 'FSHARP', fileName: 'Program.fs', runtime: '.NET SDK 9' },
    { label: 'PHP', value: 'PHP', fileName: 'main.php', runtime: 'PHP 8.5' },
    { label: 'Ruby', value: 'RUBY', fileName: 'main.rb', runtime: 'Ruby 4.0' },
    { label: 'Haskell', value: 'HASKELL', fileName: 'Main.hs', runtime: 'GHC 9.12' },
    { label: 'Go', value: 'GO', fileName: 'main.go', runtime: 'Go 1.26' },
    { label: 'Rust', value: 'RUST', fileName: 'main.rs', runtime: 'Rust 1.93' },
    { label: 'TypeScript', value: 'TYPESCRIPT', fileName: 'main.ts', runtime: 'Deno TypeScript' },
  ];

  constructor(private service: PseudoChallengeService) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  get selectedLanguage(): LanguageOption {
    return (
      [...this.primaryLanguages, ...this.moreLanguages].find(
        (item) => item.value === this.language,
      ) || this.primaryLanguages[0]
    );
  }

  get filteredChallenges(): any[] {
    const term = this.search.trim().toLowerCase();

    return this.challenges.filter((item) => {
      const status = item.status || 'NOT_ATTEMPTED';
      const text = [item.title, item.problemStatement, item.batchId, status]
        .join(' ')
        .toLowerCase();

      return text.includes(term) && (this.statusFilter === 'ALL' || status === this.statusFilter);
    });
  }

  get completedCount(): number {
    return this.challenges.filter((item) => item.status === 'PASS' || item.status === 'FAIL')
      .length;
  }

  get passedCount(): number {
    return this.challenges.filter((item) => item.status === 'PASS').length;
  }

  get pendingCount(): number {
    return this.challenges.filter((item) => !item.status || item.status === 'NOT_ATTEMPTED').length;
  }

  get codeLineCount(): number {
    return this.sourceCode.split('\n').filter((line) => line.trim()).length;
  }

  get visibleTestCases(): any[] {
    return (this.selectedChallenge?.testCases || []).filter((tc: any) => !tc.hidden);
  }

  get canRun(): boolean {
    return !!this.selectedChallenge && !!this.sourceCode.trim() && !this.running;
  }

  loadChallenges(): void {
    this.loading = true;

    this.service.getStudentChallenges().subscribe({
      next: (res: any) => {
        this.challenges = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.challenges = [];
        this.loading = false;
        this.showToast('Unable to load challenges');
      },
    });
  }

  openChallenge(id: number): void {
    this.opening = true;
    this.selectedChallenge = null;
    this.result = null;
    this.sourceCode = '';
    this.showMoreLanguages = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.getStudentChallenge(id).subscribe({
      next: (res: any) => {
        this.selectedChallenge = res?.data || res;
        this.language = 'PYTHON';
        this.setStarterCode();
        this.opening = false;
      },
      error: () => {
        this.opening = false;
        this.showToast('Unable to open challenge');
      },
    });
  }

  closeCompiler(): void {
    this.selectedChallenge = null;
    this.result = null;
    this.sourceCode = '';
    this.labFullscreen = false;
    this.showMoreLanguages = false;
  }

  changeLanguage(language: CodeLanguage): void {
    if (this.language === language) return;

    this.language = language;
    this.result = null;
    this.showMoreLanguages = false;
    this.setStarterCode();
  }

  setStarterCode(): void {
    this.sourceCode = this.starterCode(this.language);
  }

  clearCode(): void {
    this.sourceCode = '';
    this.result = null;
  }

  toggleLabFullscreen(): void {
    this.labFullscreen = !this.labFullscreen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatCode(): void {
    const tab = this.language === 'PYTHON' || this.language === 'RUST' ? '    ' : '  ';
    let indent = 0;

    this.sourceCode = this.sourceCode
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) return '';

        if (this.shouldReduceIndent(trimmed)) {
          indent = Math.max(indent - 1, 0);
        }

        const formatted = `${tab.repeat(indent)}${trimmed}`;

        if (this.shouldIncreaseIndent(trimmed)) {
          indent += 1;
        }

        return formatted;
      })
      .join('\n');
  }

  insertSnippet(type: 'input' | 'loop' | 'print', editor?: HTMLTextAreaElement): void {
    const snippets = this.snippets(this.language);
    this.insertAtCursor(snippets[type], editor);
  }

  handleEditorKeydown(event: KeyboardEvent, editor: HTMLTextAreaElement): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertAtCursor('    ', editor);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.formatCode();
      this.showToast('Code formatted');
      return;
    }

    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[event.key]) {
      event.preventDefault();
      this.insertAtCursor(`${event.key}${pairs[event.key]}`, editor, 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const lineStart = editor.value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
      const currentLine = editor.value.slice(lineStart, editor.selectionStart);
      const baseIndent = currentLine.match(/^\s*/)?.[0] || '';
      const extraIndent = this.shouldIncreaseIndent(currentLine.trim()) ? '    ' : '';

      this.insertAtCursor(`\n${baseIndent}${extraIndent}`, editor);
    }
  }

  runCode(): void {
    if (!this.selectedChallenge) return;

    if (!this.sourceCode.trim()) {
      this.showToast('Write code before running test cases');
      return;
    }

    this.running = true;

    this.service
      .submitStudentChallenge(this.selectedChallenge.id, {
        language: this.language,
        sourceCode: this.sourceCode,
      })
      .subscribe({
        next: (res: any) => {
          this.running = false;
          this.result = res?.data || res;
          this.showToast(
            this.result.status === 'PASS' ? 'All required tests passed' : 'Some tests failed',
          );
          this.loadChallenges();
        },
        error: () => {
          this.running = false;
          this.showToast('Compiler failed to run your code');
        },
      });
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2500);
  }

  getTestPercentage(test: any): number {
    const marks = Number(test?.marks || 0);
    const obtained = Number(test?.marksObtained || 0);

    if (!marks) return test?.status === 'PASS' ? 100 : 0;
    return Math.round((obtained / marks) * 100);
  }

  private shouldIncreaseIndent(line: string): boolean {
    return (
      line.endsWith(':') ||
      line.endsWith('{') ||
      line.endsWith('do') ||
      line.endsWith('then') ||
      line.endsWith('->')
    );
  }

  private shouldReduceIndent(line: string): boolean {
    return (
      line.startsWith('}') ||
      line.startsWith(']') ||
      line.startsWith(')') ||
      line === 'end' ||
      line.startsWith('end ')
    );
  }

  private insertAtCursor(
    value: string,
    editor?: HTMLTextAreaElement,
    cursorOffset = value.length,
  ): void {
    if (!editor) {
      this.sourceCode = `${this.sourceCode}${this.sourceCode ? '\n' : ''}${value}`;
      return;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const currentValue = editor.value;
    this.sourceCode = `${currentValue.slice(0, start)}${value}${currentValue.slice(end)}`;

    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(start + cursorOffset, start + cursorOffset);
    });
  }

  private snippets(language: CodeLanguage): Record<'input' | 'loop' | 'print', string> {
    const values: Record<CodeLanguage, Record<'input' | 'loop' | 'print', string>> = {
      PYTHON: {
        input: 'n = int(input())\narr = list(map(int, input().split()))',
        loop: 'for value in arr:\n    pass',
        print: 'print(result)',
      },
      JAVA: {
        input: 'Scanner sc = new Scanner(System.in);\nint n = sc.nextInt();',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'System.out.println(result);',
      },
      C: {
        input: 'int n;\nscanf("%d", &n);',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'printf("%d\\n", result);',
      },
      CPP: {
        input: 'int n;\ncin >> n;',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'cout << result << endl;',
      },
      CSHARP: {
        input: 'int n = int.Parse(Console.ReadLine()!);',
        loop: 'for (int i = 0; i < n; i++) {\n  \n}',
        print: 'Console.WriteLine(result);',
      },
      FSHARP: {
        input: 'let n = Console.ReadLine() |> int',
        loop: 'for value in arr do\n  ()',
        print: 'printfn "%d" result',
      },
      PHP: {
        input: '$n = intval(trim(fgets(STDIN)));',
        loop: 'for ($i = 0; $i < $n; $i++) {\n  \n}',
        print: 'echo $result . PHP_EOL;',
      },
      RUBY: {
        input: 'n = STDIN.gets.to_i',
        loop: 'arr.each do |value|\n  \nend',
        print: 'puts result',
      },
      HASKELL: {
        input: 'line <- getLine\nlet n = read line :: Int',
        loop: 'mapM_ print nums',
        print: 'print result',
      },
      GO: {
        input: 'var n int\nfmt.Scan(&n)',
        loop: 'for i := 0; i < n; i++ {\n  \n}',
        print: 'fmt.Println(result)',
      },
      RUST: {
        input: 'let mut input = String::new();\nio::stdin().read_to_string(&mut input).unwrap();',
        loop: 'for value in values {\n    \n}',
        print: 'println!("{}", result);',
      },
      TYPESCRIPT: {
        input: 'const input = await Deno.readTextFile("/dev/stdin");',
        loop: 'for (const value of arr) {\n  \n}',
        print: 'console.log(result);',
      },
    };

    return values[language];
  }

  private starterCode(language: CodeLanguage): string {
    const starters: Record<CodeLanguage, string> = {
      PYTHON: [
        'n = int(input())',
        'arr = list(map(int, input().split()))',
        '',
        'largest = arr[0]',
        'for num in arr:',
        '    if num > largest:',
        '        largest = num',
        '',
        'print(largest)',
      ].join('\n'),
      JAVA: [
        'import java.util.*;',
        '',
        'public class Main {',
        '  public static void main(String[] args) {',
        '    Scanner sc = new Scanner(System.in);',
        '    int n = sc.nextInt();',
        '    int largest = sc.nextInt();',
        '',
        '    for (int i = 1; i < n; i++) {',
        '      int value = sc.nextInt();',
        '      if (value > largest) {',
        '        largest = value;',
        '      }',
        '    }',
        '',
        '    System.out.println(largest);',
        '  }',
        '}',
      ].join('\n'),
      C: [
        '#include <stdio.h>',
        '',
        'int main() {',
        '  int n;',
        '  scanf("%d", &n);',
        '',
        '  int largest, value;',
        '  scanf("%d", &largest);',
        '',
        '  for (int i = 1; i < n; i++) {',
        '    scanf("%d", &value);',
        '    if (value > largest) largest = value;',
        '  }',
        '',
        '  printf("%d\\n", largest);',
        '  return 0;',
        '}',
      ].join('\n'),
      CPP: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'int main() {',
        '  int n;',
        '  cin >> n;',
        '',
        '  int largest, value;',
        '  cin >> largest;',
        '',
        '  for (int i = 1; i < n; i++) {',
        '    cin >> value;',
        '    if (value > largest) largest = value;',
        '  }',
        '',
        '  cout << largest << endl;',
        '  return 0;',
        '}',
      ].join('\n'),
      CSHARP: [
        'using System;',
        '',
        'class Program {',
        '  static void Main() {',
        '    int n = int.Parse(Console.ReadLine()!);',
        '    int[] arr = Array.ConvertAll(Console.ReadLine()!.Split(), int.Parse);',
        '',
        '    int largest = arr[0];',
        '    foreach (int value in arr) {',
        '      if (value > largest) largest = value;',
        '    }',
        '',
        '    Console.WriteLine(largest);',
        '  }',
        '}',
      ].join('\n'),
      FSHARP: [
        'open System',
        '',
        'let n = Console.ReadLine() |> int',
        'let arr = Console.ReadLine().Split() |> Array.map int',
        'let largest = arr |> Array.max',
        '',
        'printfn "%d" largest',
      ].join('\n'),
      PHP: [
        '<?php',
        '$n = intval(trim(fgets(STDIN)));',
        '$arr = array_map("intval", explode(" ", trim(fgets(STDIN))));',
        '',
        '$largest = $arr[0];',
        'foreach ($arr as $value) {',
        '  if ($value > $largest) $largest = $value;',
        '}',
        '',
        'echo $largest . PHP_EOL;',
      ].join('\n'),
      RUBY: [
        'n = STDIN.gets.to_i',
        'arr = STDIN.gets.split.map(&:to_i)',
        '',
        'largest = arr[0]',
        'arr.each do |value|',
        '  largest = value if value > largest',
        'end',
        '',
        'puts largest',
      ].join('\n'),
      HASKELL: [
        'main :: IO ()',
        'main = do',
        '  _ <- getLine',
        '  nums <- fmap (map read . words) getLine',
        '  print (maximum (nums :: [Int]))',
      ].join('\n'),
      GO: [
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  var n int',
        '  fmt.Scan(&n)',
        '',
        '  var largest, value int',
        '  fmt.Scan(&largest)',
        '',
        '  for i := 1; i < n; i++ {',
        '    fmt.Scan(&value)',
        '    if value > largest {',
        '      largest = value',
        '    }',
        '  }',
        '',
        '  fmt.Println(largest)',
        '}',
      ].join('\n'),
      RUST: [
        'use std::io::{self, Read};',
        '',
        'fn main() {',
        '    let mut input = String::new();',
        '    io::stdin().read_to_string(&mut input).unwrap();',
        '    let mut nums = input.split_whitespace().map(|x| x.parse::<i32>().unwrap());',
        '',
        '    let n = nums.next().unwrap();',
        '    let mut largest = nums.next().unwrap();',
        '',
        '    for _ in 1..n {',
        '        let value = nums.next().unwrap();',
        '        if value > largest {',
        '            largest = value;',
        '        }',
        '    }',
        '',
        '    println!("{}", largest);',
        '}',
      ].join('\n'),
      TYPESCRIPT: [
        'const input = await Deno.readTextFile("/dev/stdin");',
        'const nums = input.trim().split(/\\s+/).map(Number);',
        '',
        'const n = nums[0];',
        'const arr = nums.slice(1, n + 1);',
        'const largest = Math.max(...arr);',
        '',
        'console.log(largest);',
      ].join('\n'),
    };

    return starters[language];
  }
}
