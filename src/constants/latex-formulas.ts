export interface FormulaItem {
  id: string;
  latex: string;
  title: string;
}

export interface FormulaCategory {
  key: string;
  name: string;
  items: FormulaItem[];
}

export const LATEX_FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    key: 'complexity',
    name: 'Độ phức tạp',
    items: [
      { id: 'c1', latex: 'O(1)', title: 'Hằng số' },
      { id: 'c2', latex: 'O(\\log n)', title: 'Logarit' },
      { id: 'c3', latex: 'O(n)', title: 'Tuyến tính' },
      { id: 'c4', latex: 'O(n \\log n)', title: 'Linearithmic' },
      { id: 'c5', latex: 'O(n^2)', title: 'Bậc hai' },
      { id: 'c6', latex: 'O(2^n)', title: 'Hàm mũ' },
      { id: 'c7', latex: '\\Omega(n)', title: 'Chặn dưới' },
      { id: 'c8', latex: '\\Theta(n)', title: 'Chặn chặt' },
    ],
  },
  {
    key: 'algebra',
    name: 'Đại số & Giải tích',
    items: [
      { id: 'a1', latex: '\\frac{a}{b}', title: 'Phân số' },
      { id: 'a2', latex: '\\sqrt{x}', title: 'Căn bậc hai' },
      { id: 'a3', latex: 'x^{n}', title: 'Lũy thừa' },
      { id: 'a4', latex: 'a_{i}', title: 'Chỉ số dưới' },
      { id: 'a5', latex: '\\sum_{i=1}^{n}', title: 'Tổng Sigma' },
      { id: 'a6', latex: '\\prod_{i=1}^{n}', title: 'Tích Pi' },
      { id: 'a7', latex: '\\lim_{x \\to \\infty}', title: 'Giới hạn' },
      { id: 'a8', latex: '\\int_{a}^{b} f(x) dx', title: 'Tích phân' },
      { id: 'a9', latex: '\\log_2(n)', title: 'Logarit cơ số 2' },
    ],
  },
  {
    key: 'relations',
    name: 'Quan hệ & Tập hợp',
    items: [
      { id: 'r1', latex: '\\le', title: 'Nhỏ hơn hoặc bằng' },
      { id: 'r2', latex: '\\ge', title: 'Lớn hơn hoặc bằng' },
      { id: 'r3', latex: '\\neq', title: 'Khác' },
      { id: 'r4', latex: '\\approx', title: 'Xấp xỉ' },
      { id: 'r5', latex: '\\in', title: 'Thuộc tập hợp' },
      { id: 'r6', latex: '\\notin', title: 'Không thuộc' },
      { id: 'r7', latex: '\\subset', title: 'Tập con' },
      { id: 'r8', latex: '\\cup', title: 'Hợp' },
      { id: 'r9', latex: '\\cap', title: 'Giao' },
      { id: 'r10', latex: '\\emptyset', title: 'Tập rỗng' },
    ],
  },
  {
    key: 'symbols',
    name: 'Ký hiệu & Hy Lạp',
    items: [
      { id: 's1', latex: '\\infty', title: 'Vô cực' },
      { id: 's2', latex: '\\alpha', title: 'Alpha' },
      { id: 's3', latex: '\\beta', title: 'Beta' },
      { id: 's4', latex: '\\theta', title: 'Theta' },
      { id: 's5', latex: '\\lambda', title: 'Lambda' },
      { id: 's6', latex: '\\pi', title: 'Số Pi' },
      { id: 's7', latex: '\\forall', title: 'Với mọi' },
      { id: 's8', latex: '\\exists', title: 'Tồn tại' },
      { id: 's9', latex: '\\implies', title: 'Suy ra' },
      { id: 's10', latex: '\\iff', title: 'Tương đương' },
    ],
  },
];
