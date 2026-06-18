import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AIParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  notes: string;
}

export async function parseTransactionsWithAI(
  input: string,
  categories: { id: string; name: string; type: string }[],
): Promise<AIParsedTransaction[]> {
  if (!ai) {
    throw new Error(
      'Chưa cấu hình VITE_GEMINI_API_KEY. Vui lòng thêm vào file .env.local!',
    );
  }

  const categoriesContext = categories
    .map((c) => `- ID: ${c.id} | Tên: ${c.name} | Loại: ${c.type}`)
    .join('\n');

  const today = new Date().toISOString().split('T')[0];

  const prompt = `
Bạn là một trợ lý tài chính thông minh. Nhiệm vụ của bạn là đọc câu nói của người dùng và trích xuất các khoản thu/chi thành một mảng JSON chuẩn.

Ngày hôm nay là: ${today}

Danh sách các Danh mục khả dụng của người dùng:
${categoriesContext}

Quy tắc bắt buộc:
1. Bạn CHỈ ĐƯỢC trả về một mảng JSON thuần túy, tuyệt đối không kèm markdown, không kèm lời giải thích (không có \`\`\`json).
2. Định dạng mỗi phần tử trong mảng: 
{
  "amount": (số nguyên, ví dụ: 50k = 50000, 1 củ = 1000000),
  "type": "expense" hoặc "income",
  "category_id": (chọn đúng ID của danh mục phù hợp nhất từ danh sách trên),
  "date": (định dạng YYYY-MM-DD. Nếu nói hôm nay thì lấy ${today}, hôm qua thì lùi 1 ngày...),
  "notes": (chuỗi ngắn mô tả khoản này, tối đa 50 ký tự, ví dụ "đổ xăng", "ăn bún bò")
}
3. Nếu không tìm thấy category_id hoàn toàn khớp, hãy cố gắng suy luận (vd: "đổ xăng" -> danh mục "Di chuyển", "lương" -> danh mục "Lương"). Nếu tuyệt đối không có danh mục nào liên quan dù là xa nhất, hãy chọn ID của một danh mục có type tương ứng bất kỳ, nhưng ưu tiên khớp ngữ nghĩa nhất.
4. Mọi số tiền như "50k", "5 chục", "năm chục" đều quy ra số nguyên 50000.

Câu nói của người dùng:
"${input}"
`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = result.text || '';

    // Loại bỏ markdown code blocks nếu AI vô tình trả về
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      throw new Error('AI không trả về mảng JSON.');
    }
  } catch (error) {
    console.error('Lỗi khi phân tích bằng AI:', error);
    throw new Error(
      'Không thể phân tích dữ liệu. Vui lòng thử lại hoặc nói rõ ràng hơn.',
    );
  }
}
