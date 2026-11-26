# Kế hoạch triển khai ILMS từ giao bài đến bản đồ nhiệt tri thức

Kế hoạch giao việc cho FE, BE và QA dựa trên [kết quả UAT ngày 25/11/2026](../reports/2026-11-25-assessment-gradebook-heatmap-uat.md). Mục tiêu là giảng viên giao bài đúng lớp và môn, sinh viên nộp được, điểm truy xuất được và giảng viên mở được bằng chứng cho từng ô trên bản đồ nhiệt.

## Phân công và thứ tự

| Giai đoạn | Chủ trì | Việc FE có thể làm song song | Điều kiện hoàn thành |
|---|---|---|---|
| **1. Khôi phục dữ liệu và luồng hiện có** | BE sửa schema, lưu câu hỏi, phản hồi API và phân quyền | FE sửa adapter, trạng thái lỗi, thông báo thành công và điểm vào đang hỏng | DB mới và DB nâng cấp đọc được kỳ thi và bảng điểm. Câu hỏi lưu được. FE hiển thị đúng dữ liệu đã lưu. |
| **2A. Giao bài và bảng điểm theo môn** | BE định nghĩa ngữ cảnh lớp–môn, bài giao, điểm theo bài | FE dùng chung màn hình cho trang lớp và môn, nối luồng nộp và chấm | Giao lời nhắn hoặc bài văn bản, nộp, chấm và thấy điểm thật ở đúng lớp–môn. |
| **2B. Giao bộ câu hỏi và làm quiz** | BE chốt phiên bản đề, lưu lượt làm, chấm và nối điểm | FE tái dùng trình soạn câu hỏi và thêm màn làm bài | Giảng viên giao quiz từ bộ có sẵn hoặc tạo mới. Sinh viên làm và nhận điểm qua giao diện. |
| **2C. Kiểm tra trực tuyến** | BE tái dùng luồng quiz với lịch thi và công bố điểm | FE thêm trạng thái phòng thi và màn công bố điểm | Thi đúng giờ, vào lại đúng lượt, nộp đúng một kết quả và trả điểm đúng thời điểm. |
| **3. Bản đồ nhiệt có thể kiểm chứng** | BE chịu trách nhiệm bằng chứng, phạm vi dữ liệu và phép tính | FE nối đúng lớp–môn, trình bày số liệu và nguồn của từng ô | Ba sinh viên đúng, sai và chưa làm ra ba trạng thái khác nhau. Đổi trang hoặc lớp lấy đúng số liệu. |

FE và BE chốt payload mẫu và các mã lỗi ở đầu mỗi gói. FE có thể phát triển với fixture hợp đồng trong lúc BE triển khai. QA chỉ đánh dấu một luồng hoàn thành khi chạy được với API thật. Gói 3 có thể mở thử cho **quiz có nhãn** ngay khi 2B đạt. Phần đưa kỳ thi vào heatmap phụ thuộc 2C.

### Mặc định nghiệp vụ đề xuất

- Mỗi lần giao cho cả một lớp. Một môn có thể dùng chung nhiều lớp. Bảng điểm và dữ liệu làm bài luôn có cả `classId` và `courseId`. Hỗ trợ giao theo nhóm hoặc từng sinh viên là một mở rộng riêng.
- Bốn lựa chọn trong nút `+ Tạo` gồm **Lời nhắn**, **Bài nộp**, **Bài tập có câu hỏi**, **Bài kiểm tra**. Lời nhắn nằm trong danh sách bài của môn, chỉ đọc và không sinh bản ghi nộp hay cột điểm.
- Bản đầu phát hành **nộp văn bản**, **quiz một đáp án** và **kiểm tra một đáp án**. Bài nộp có thể chấm tay. Quiz và kiểm tra chấm tự động. Một lượt làm cho mỗi quiz hoặc kỳ thi trong lần nghiệm thu đầu. Giao diện chỉ hiện loại câu được bộ chấm hỗ trợ.
- Điểm bài nộp và quiz có thể xem ngay sau khi chấm trong lần phát hành đầu. Kỳ thi chỉ hiện điểm khi giảng viên công bố. Đáp án và lời giải của kỳ thi chỉ được xem sau khi kỳ thi đóng và theo chính sách trả kết quả.

## Giai đoạn 1 · Khôi phục schema, API và tính trung thực của FE

### G1-BE · Sửa schema và luồng lưu dữ liệu

1. **Exam và dữ liệu giao bài cũ.** Thêm migration Flyway mới và đối chiếu schema thật để nhận diện môi trường đã từng bổ sung cột. Với `exams`, thêm `class_id`, `course_id`, `title` và backfill từ `assessments` cùng ID. Rà soát tĩnh seed hiện tại thấy **4 kỳ thi và 8 bài tập không có assessment cùng ID**. Kiểm tra cả va chạm ID và các bảng con trước khi backfill. Liên kết chỉ được tạo từ nguồn xác minh được lớp–môn. Bản ghi chưa xác minh giữ dữ liệu, để cột nullable trong giai đoạn chuyển tiếp và đưa vào danh sách cần xử lý. Bản ghi mới luôn phải có ngữ cảnh hợp lệ. Chỉ siết `NOT NULL` khi xử lý xong dữ liệu cũ. Dùng `assessments` làm nguồn ngữ cảnh chính và giữ ba trường tương thích đồng bộ.
2. **Bảng điểm tổng hợp của lớp.** Thêm `class_id` và `student_id` vào `grade_reports`, backfill từ `class_members`, kiểm tra trùng cặp rồi mới bật unique. Giữ đúng các điểm `0` và `NULL`. Nếu áp dụng hành vi giữ học bạ khi membership bị xóa như entity/service hiện mô tả, mở nullable cho `class_member_id` và chuyển FK sang `ON DELETE SET NULL` sau backfill. Xuất số lượng và mã bản ghi bất thường để có cách xử lý nhất quán khi nâng DB.
3. **Ngân hàng câu hỏi.** Trong `QuestionService`, khởi tạo entity tường minh rồi dùng `applyQuestionFields` cho các luồng tạo đơn, tạo lô và import hội tụ qua cùng logic. ID, người tạo và thời gian do BE gán. Kiểm tra môn, nội dung, lựa chọn và đáp án trước khi lưu. Kiểm thử GET lại sau khi lưu và khi tạo lô thất bại. Với các trường đề nâng cao đang có trong UI/DTO, kiểm tra lưu rồi đọc lại, và bổ sung lưu trữ cho trường được đưa vào nghiệm thu. Hai ca `ModelMapper.ConfigurationException` phải xanh.
4. **Công bố và quyền quiz.** Áp dụng cùng kiểm quyền tài nguyên cho cập nhật đề, thêm câu đơn/lô và công bố. Từ chối đề rỗng hoặc thiếu đáp án hợp lệ. Kiểm tra lớp–môn và trạng thái công bố nhất quán khi lấy đề và bắt đầu. DTO dành cho sinh viên chỉ chứa nội dung được làm. Rà soát quyền đọc kết quả trước và sau nộp. Sửa các assertion `getContent()` thành `getItems()` trong `PloServiceTest` để khôi phục chạy suite.
5. **Heatmap chặn tín hiệu sai.** Khắc phục ngay việc đưa người chưa có câu trả lời vào danh sách yếu, đồng thời khóa contract và thôi dùng ID demo ở đường vào màn hình. Nếu đầu vào lỗi, trả trạng thái lỗi hoặc nguồn chưa sẵn sàng. Thu thập và mở bằng chứng chi tiết là phần giai đoạn 3.

Tệp chính. [Exam entity](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/entity/Exam.java:32>) · [ExamService](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/ExamService.java:187>) · [Seed hiện hành](<D:/ILMS project/ILMS-BE/src/main/resources/db/migration/V20261101224050__seed_db.sql:344>) · [GradeReport](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/entity/GradeReport.java:25>) · [QuestionService](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/QuestionService.java:164>) · [QuizController](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/controller/QuizController.java:94>)

### G1-FE · Sửa đọc dữ liệu và phản hồi thao tác

1. **Sửa mapper điểm.** Dùng schema phân trang cho `data.items`, tách parse response danh sách và response cá nhân. Khi `items` có hai người, render hai hàng. Giữ `null` là chưa có điểm. Bỏ suy PLO, điểm chữ và điểm quiz từ các giá trị mặc định khi API chưa cung cấp. Giữ báo cáo chuyên cần/giữa kỳ/cuối kỳ trong màn điểm tổng hợp; giai đoạn 2A thêm bảng điểm từng bài.
2. **Tách dữ liệu demo khỏi luồng thật.** Với lớp thật, `quiz.service.ts` trả lỗi đúng từ API ở create, attach, publish, start, submit và result. Bỏ tự tạo ID cục bộ, điểm mẫu, số người nộp hoặc điểm trung bình mẫu. Schema quiz chấp nhận `courseId` và dùng trạng thái BE xác nhận, bỏ mặc định `PUBLISHED`. `assessment-hub.service.ts` và lớp dùng cùng quy tắc. Khi một nguồn dữ liệu lỗi, báo lỗi và có thể thử lại ngay tại phần đó.
3. **Sửa form giao bài.** Tại `CreateClassworkPageView` và `TeacherCreateQuizStudioView`, luồng là lưu bản nháp → lưu bộ câu hỏi → công bố. Chỉ hiện **Đã giao** khi bước công bố thành công. **Lưu nháp** hiển thị trạng thái khác. Nếu đã có ID nháp, giữ form và ID khi thử lại. Chặn bấm liên tiếp khi request đang chạy. Lấy `courseId` từ lựa chọn hợp lệ. Dùng service ngân hàng câu hỏi thật khi tạo câu. Với form thi, gửi giờ theo `LocalDateTime` của contract hiện tại. Đường dùng `toISOString()` đang gửi hậu tố `Z` mà DTO từ chối.
4. **Chặn đường dẫn hỏng trong đợt sửa.** Các nút làm quiz, thi, analytics chỉ xuất hiện hoặc bật khi tính năng được nối. Dùng màn chi tiết bài nộp thật cho **Xem bài đã nộp** và **Xem bài đã chấm**. Với bài văn bản, hiện thông báo rõ về một lần nộp và cách nộp đang được server hỗ trợ.
5. **Sửa contract heatmap.** Parse tên trường BE thực tế trước, chuyển sang dạng đọc cho UI tại adapter. Cùng một wire contract cho phân trang, ô điểm và điểm yếu. FE bỏ bộ chọn môn giả, không tự quy đổi `0` thành chưa làm hoặc dùng danh sách rỗng để che lỗi parse.

Tệp chính. [Mapper bảng điểm](<D:/ILMS project/ILMS-FE/src/features/classes/services/class-detail.service.ts:1467>) · [Dịch vụ quiz](<D:/ILMS project/ILMS-FE/src/features/assignments/services/quiz.service.ts:720>) · [Form giao bài](<D:/ILMS project/ILMS-FE/src/features/classes/components/detail/CreateClassworkPageView.tsx:161>) · [Studio](<D:/ILMS project/ILMS-FE/src/features/assignments/components/teacher/TeacherCreateQuizStudioView.tsx:851>) · [Heatmap adapter](<D:/ILMS project/ILMS-FE/src/features/outcomes/services/outcome.service.ts:196>)

### Cổng QA giai đoạn 1

- Dựng schema sạch bằng Flyway trên MySQL 8 và nâng một bản sao có dữ liệu cũ. So số bản ghi, điểm 0, điểm null, câu hỏi và bài nộp trước/sau. Kiểm tra phiên bản migration và constraint.
- Owner/Teacher đọc được bảng điểm và tạo/đọc được kỳ thi. Student không tạo bài, không đọc đáp án trong đề đang làm. Đề trống không công bố được. Câu hỏi tạo đơn, tạo lô, import và đọc lại đều khớp.
- Mô phỏng BE lỗi sau khi tạo nháp. FE vẫn ở đúng form, nút thử lại dùng đúng ID, không tạo bài thứ hai, không hiện “Đã giao”. Hai sinh viên từ `items` ra hai hàng. API lỗi khác trạng thái chưa có dữ liệu.

## Giai đoạn 2A · Bài giao dùng chung và bảng điểm thật

### G2A-BE · Chuẩn hóa bản ghi giao bài theo lớp–môn

1. Dùng `assessments` làm ID nghiệp vụ của một lần giao. `Assignment` và `Exam` tiếp tục dùng ID hiện có. Thêm trạng thái cho bài tập, kiểu phản hồi `READ_ONLY`, `TEXT`, `QUIZ` và cờ `countsTowardGrade`. Backfill bài tập cũ là `PUBLISHED + TEXT` và có tính điểm. Giữ tương thích với caller cũ của API tạo bài. Form mới gửi lưu nháp rõ ràng rồi gọi công bố. Kỳ thi dùng trạng thái công bố đang lưu của `Exam` trong bước này.
2. Thêm điểm đọc danh sách giao bài chung theo `classId + courseId`, trả loại bài, tiêu đề, trạng thái, hạn hoặc lịch, `assessmentId`, quyền thao tác và tiến độ theo vai trò. Tính số đã nộp từ DB. Lời nhắn chỉ đọc không sinh lượt nộp. Lời nhắn đã tồn tại ở Bảng tin vẫn là thông báo lớp. Kiểm tra liên kết lớp–môn hoạt động và thành viên có quyền trên từng request. Điểm đọc context chỉ trả lớp đủ quyền của người dùng. Endpoint liệt kê lớp của môn công khai hiện tại chưa mang điều kiện membership này.
3. Thêm bản đọc gradebook theo bài. Cột lấy các bài đã giao có bật tính điểm. Hàng lấy sinh viên của lớp. Ô dùng điểm chấm và trạng thái bài nộp. DTO đề xuất gồm `columns[{assessmentId,title,kind,maxScore}]` và `students.items[{studentId,name,cells}]`. Ô cung cấp `status, score, maxScore, submissionId` và thông tin được phép xem. Tách endpoint `/me` để phản hồi của sinh viên chỉ chứa điểm của họ. Giai đoạn này lấy điểm tay từ `Grading`. Quiz/thi đưa vào qua cùng bản đọc khi các gói sau đạt.
4. Giữ một lần nộp văn bản trong pilot và dùng capability server để điều khiển nút. Sau pilot, nếu mở **Nộp lại**, lưu số lần tối đa trên bài, chỉ nhận lại khi còn lượt, còn hạn theo chính sách và đã cho phép sửa bài đã chấm theo nghiệp vụ. Nếu mở **Nộp tệp**, kiểm quyền tệp, giới hạn kích thước, quota, ràng buộc tệp với bài nộp và quyền tải theo lớp. Thêm ca upload xong nhưng chưa nộp và retry tạo liên kết.

### G2A-FE · Dùng cùng màn hình ở trang lớp và môn

1. Đưa phần danh sách và form giao bài vào feature assignments dùng chung. Trang lớp giữ `classId` và chọn môn thật. Trang chi tiết môn thêm **Bài tập** và **Bảng điểm**, giữ `courseId` và chọn lớp được phép. Link đi từ lớp sang môn giữ ngữ cảnh lớp. URL lưu tab và phạm vi. Query key gồm lớp, môn, vai trò/mode và filter có liên quan. Khi đổi lớp, chỉ render dữ liệu thuộc phạm vi mới.
2. Giữ một nút `+ Tạo`. Lời nhắn dùng hai ô tiêu đề, nội dung. Bài nộp thêm nội dung yêu cầu, hạn nộp và tính điểm. Lấy capability từ API sau khi chọn lớp. Khi back từ màn chi tiết, trở về đúng tab và lớp. Dùng màn nộp và chấm hiện có làm điểm mở chi tiết.
3. Bảng điểm giảng viên có cột tên cố định, cột bài tính điểm, cuộn ngang và phân trang. Bấm cột mở danh sách bài nộp, bấm ô mở phiếu nộp/chấm. Bảng điểm sinh viên là danh sách của chính mình. Dùng badge trạng thái và hiển thị `0/10` khi điểm là 0. Dùng namespace i18n hiện có và xác nhận light/dark, mobile, thao tác bàn phím.
4. Sau khi giao hoặc chấm thành công, invalidate đúng query classwork và gradebook theo lớp–môn. Khi viết điểm lỗi, giữ điểm đã lưu lần trước và giữ nội dung sửa trong form.

Tệp chính. [Assessment](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/entity/Assessment.java:14>) · [AssignmentService](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/AssignmentService.java:61>) · [SubmissionService](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/SubmissionService.java:94>) · [Điểm vào lớp](<D:/ILMS project/ILMS-FE/src/features/classes/components/detail/ClassAssignmentsTab.tsx:44>) · [Điểm vào môn](<D:/ILMS project/ILMS-FE/src/features/courses/components/detail/CourseDetailPageView.tsx:38>)

**Xong khi** hai lớp cùng môn cho hai danh sách và bảng điểm riêng. Lời nhắn xuất hiện trong tab vừa giao và không sinh ô điểm. Sinh viên lớp A nộp văn bản, giảng viên sửa điểm từ chưa chấm sang 0 rồi lên 8, sinh viên đọc lại đúng điểm. Sinh viên lớp B không thấy bài và không đọc được bài nộp lớp A.

## Giai đoạn 2B · Bộ câu hỏi, giao quiz và làm bài

### G2B-BE · Chốt phiên bản đề và tính điểm từ lượt làm

1. Tái dùng `Quiz`, `QuizQuestion`, `QuizOption` để soạn bộ và lấy câu từ ngân hàng. Phân biệt bộ dùng lại và đề của lần giao để bộ nháp không xuất hiện với sinh viên. Đề xuất bảng liên kết `assessment_quiz_deliveries(assessment_id, quiz_id)` có khóa duy nhất ở cả hai đầu. Khi công bố, copy bộ sang bản đề riêng của assessment, chốt thứ tự, nội dung, đáp án, điểm câu và mã khái niệm trong một giao dịch. Bản đề của lần giao chỉ chơi qua luồng assessment để mọi lượt chịu cùng kiểm tra phạm vi và lịch. Sửa bộ gốc chỉ áp dụng cho lần giao sau. Đề đã có lượt làm giữ nguyên cấu trúc.
2. Bắt đầu từ `assessmentId`, tìm đề đã chốt và tạo/reuse lượt làm. Reuse `submissions` với cả `assessment_id` và `quiz_id`, reuse `quiz_answers` cho câu đã trả lời. Kiểm quyền trước khi bắt đầu, và kiểm tra lại khi nộp/khi đọc điểm. BE ràng buộc câu và lựa chọn vào đúng đề của lượt, kiểm trùng, kiểm chủ lượt, thời hạn và số lần. Quy định một kết quả cho một lần nộp, kể cả FE gửi lại sau mất mạng. Lưu chấm và câu trả lời cùng transaction.
3. Chuẩn hóa điểm. BE trả `score`, `maxScore`, `correctCount` và trạng thái. Đề bài có thang điểm do giảng viên chọn, mặc định 10 cho quiz giao mới. Tính điểm dựa trên tổng điểm câu và thang đã chốt. Kỳ thi dùng tổng điểm cấu hình. Quiz cũ tiếp tục có thang `/10` theo contract đang dùng. Câu chưa trả lời và câu đã trả lời sai được lưu hoặc suy từ đề đã chốt theo quy tắc rõ để phục vụ phân tích. Tự luận chờ chấm nếu được bổ sung sau.
4. Đưa kết quả quiz vào bảng điểm khi `countsTowardGrade` bật. Các quiz/lượt cũ chỉ liên kết ngược nếu có bằng chứng xác định đúng lần giao. Tiếp tục đọc dữ liệu cũ qua luồng quiz hiện có. Chuẩn hóa việc lọc để một lần giao chỉ hiện một dòng trong danh sách.
5. Viết analytics tối thiểu từ số người đã nộp, điểm và câu trả lời thực. Bộ câu hỏi chưa có câu concept vẫn giao được khi giảng viên xác nhận độ phủ, và FE hiển thị số câu có nhãn. Bản đồ nhiệt chỉ lấy phần có bằng chứng hợp lệ.

### G2B-FE · Soạn và làm quiz trong luồng giao bài

1. Tách vùng chỉnh câu hỏi đã có trong `TeacherCreateQuizStudioView` và `QuizQuestionPickerPanel` để gọi trong form. Có **Soạn mới**, **Chọn bộ có sẵn**, **Dùng bộ này**, **Đổi bộ** và **Xem trước**. Quay về cùng bản nháp, giữ lớp và môn. Hiện số câu, tổng điểm và số câu có nhãn tri thức.
2. Dùng một route làm bài theo assessment, đề xuất `/classes/[id]/assessments/[assessmentId]/play`. Cập nhật cả trang môn, trang lớp và Assessment Hub. Render thứ tự BE gửi. Hiện trạng thái đã nộp hoặc tiếp tục lượt đang làm theo dữ liệu server. Giữ lựa chọn khi mất mạng và dùng lại cùng lượt khi thử gửi. Màn kết quả đọc lại từ API và chỉ hiển thị điểm/đáp án được phép.
3. Đổi các nút dựa trên trạng thái thật. `Làm quiz` → `Tiếp tục` → `Xem kết quả`. Điểm cập nhật lên đúng cột ở cả FE giảng viên và FE sinh viên. Trường hợp bài luyện tập không tính điểm, vẫn có kết quả riêng tại bài.

**Xong khi** giảng viên giao hai bài từ cùng bộ cho hai lớp, sinh viên làm được qua trình duyệt, đề cũ không đổi sau khi sửa bộ, reload tiếp tục đúng lượt, gửi lại chỉ có một kết quả và dữ liệu sai lớp bị từ chối. Chạy cả ca toàn đúng, toàn sai, câu bỏ trống và quiz không tính điểm.

## Giai đoạn 2C · Bài kiểm tra có thời gian và công bố điểm

- **BE:** Reuse `ExamService` và `ExamQuestionService` để quản lý lịch và câu hỏi. Khi công bố, dùng cùng cơ chế đề chốt và lượt làm của quiz. Diễn giải giờ soạn đề theo múi giờ nghiệp vụ đã cấu hình, dùng đồng hồ BE và trả `expiresAt` có offset cho player. Hạn cá nhân là thời điểm sớm hơn giữa giờ đóng và giờ bắt đầu lượt cộng thời lượng. Lưu đáp án nháp lên server. Khi hết thời gian, chốt đáp án đã lưu theo một quy tắc idempotent. Nếu lượt hết hạn mà chưa có đáp án, giữ trạng thái hết hạn/chưa nộp riêng. Bổ sung thao tác công bố điểm theo kỳ thi và audit người bấm. Điểm chưa công bố chỉ xuất hiện ở phía có quyền chấm. Sinh viên xem lịch và hướng dẫn trước giờ mở.
- **FE:** Dùng chung trình soạn bộ câu hỏi của 2B. Thêm giờ mở, giờ đóng, số phút và xem trước. Màn sinh viên có **Sắp mở**, **Có thể bắt đầu**, **Đang làm**, **Đã nộp** và **Chờ công bố**. Đồng hồ hiển thị từ `expiresAt` BE trả, đồng bộ khi load lại. Hiện trạng thái lưu câu trả lời để sinh viên biết phần nào đã lên server. Giảng viên có danh sách kết quả và nút **Công bố điểm**. Bảng điểm cá nhân mở được kết quả khi server đưa qua trạng thái công bố.
- **QA:** Kiểm tra trước giờ, đúng giờ, sát giờ đóng, reload, mạng chập chờn, double submit, đụng thời lượng cá nhân, điểm trước/sau công bố và thử với môn ở lớp khác. Chạy một đề có tổng điểm khác 10 và một ca trình duyệt khác múi giờ để kiểm thời gian và thang điểm.

## Giai đoạn 3 · Heatmap theo câu trả lời có thể truy nguyên

### G3-BE · Chuẩn hóa bằng chứng và phép tính

1. Gắn concept bằng cặp `courseId + canonicalCode` từ đồ thị môn, kèm tên hiển thị. Dùng ID bản ghi mapping chỉ để sửa mapping. Khi công bố đề, chốt mapping trên câu của phiên bản giao, đề xuất `quiz_question_concepts(quiz_question_id, canonical_code)` với khóa duy nhất cho mỗi câu–concept. Rà kích thước cột cũ `question_concepts.concept_id` (64) so với mã đồ thị được nhận tới 128 ký tự. Khi tên tri thức đổi, lịch sử vẫn liên kết theo mã. Chỉ backfill dữ liệu cũ nếu xác định được mã một cách chắc chắn, ghi nhận câu chưa gắn nhãn.
2. Đọc từ những lượt nộp hợp lệ của quiz đã giao và câu có nhãn. Thêm kỳ thi sau khi luồng thi đạt, sử dụng kết quả đã công bố theo vai trò. Trì hoãn nguồn Socratic và bài nộp tự luận đến khi định nghĩa được bằng chứng theo tiêu chí. Một câu được tính một lần cho một concept. Nếu mở nhiều lượt, heatmap lấy lượt đã chấm gần nhất của cùng lần giao, để tránh một sinh viên luyện lại nhiều lần làm sai mẫu số. Điểm gradebook theo chính sách chọn lượt của bài nếu có.
3. Chốt phép tính pilot. Điểm của một sinh viên theo một khái niệm = số câu đúng / số câu hợp lệ đã chấm × 100. Câu bỏ trống trong lượt đã nộp tính là sai. Người chưa nộp, chưa chấm hoặc chỉ nộp bài không gắn nhãn cho concept đó có giá trị `null`, số bằng chứng bằng 0. Khi có bằng chứng, giữ ngưỡng sẵn của BE cho màu dưới 40, 40 đến dưới 70, 70 đến dưới 90, từ 90. Cảnh báo điểm yếu là tín hiệu riêng. Trong pilot, đề xuất cảnh báo dưới 50% khi có ít nhất ba câu đã chấm cho cùng concept, mặc định có thể cấu hình. Mẫu 1–2 câu vẫn hiện điểm và nhãn “Ít dữ liệu”.
4. Giữ format BE `concepts`, `students.items`, `classAverages[].masteryStatus`, `gaps`, `atRiskStudents[].overallMastery`. Bổ sung số bằng chứng, số sinh viên có dữ liệu, sĩ số và thời điểm tổng hợp. Trung bình cho cả lớp là trung bình theo sinh viên có bằng chứng, tính trên toàn lớp trước khi phân trang. Tách lỗi nguồn dữ liệu khỏi kết quả 0. API chi tiết ô trả bài nguồn, mã phiên bản, số câu đúng/sai và thời điểm nộp. Các trường kết quả chi tiết tuân theo quyền và chính sách trả đáp án.
5. Kiểm quyền lớp–môn trước khi tổng hợp. Giảng viên có quyền thấy lớp và khoảng trống của lớp. Sinh viên thấy hàng của mình, không nhận danh sách nguy cơ lớp. Dùng chung ngữ cảnh lớp–môn với gradebook và kiểm tra tốc độ với lớp lớn, tránh query theo từng ô.

### G3-FE · Giảng viên thấy số liệu và lý do

1. Đặt lối vào **Bản đồ nhiệt** ở ngữ cảnh Bảng điểm của lớp–môn. Hiện đúng tên môn và lớp, giữ bộ chọn khi qua lại. Điều khiển phân trang/tìm sinh viên ở server. Chuyển trang không làm đổi trung bình cả lớp.
2. Ô có `100%`, `0%`, hoặc **Chưa có dữ liệu**. Màu và label dùng trạng thái server. Hiện số câu và nhãn **Ít dữ liệu** khi cần. Tóm tắt nêu độ phủ, ví dụ **2/3 sinh viên có dữ liệu**, giúp giảng viên biết cỡ mẫu.
3. Bấm ô mở panel chi tiết với câu thuộc bài nào, đúng/sai bao nhiêu, thời điểm nào. Bấm tên concept lọc người có bằng chứng yếu. Hiện lỗi API và nút thử lại tại phần bị lỗi. Giữ bố cục đọc được trên mobile và bằng bàn phím.

Tệp chính. [Nguồn câu trả lời](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/KnowledgeHeatmapService.java:562>) · [Tính trạng thái](<D:/ILMS project/ILMS-BE/src/main/java/com/example/ilms/service/KnowledgeHeatmapService.java:667>) · [Schema FE](<D:/ILMS project/ILMS-FE/src/features/outcomes/schemas/knowledge-heatmap.schema.ts:50>) · [Ma trận FE](<D:/ILMS project/ILMS-FE/src/features/outcomes/components/ClassKnowledgeHeatmapMatrix.tsx:33>)

**Xong khi** ca tái hiện UAT cho kết quả **100%**, **0%** và **Chưa có dữ liệu**. Độ phủ **2/3**, mức trung bình **50%**. Người chưa làm không bị báo yếu. Bổ sung một ca đủ ba câu sai để kiểm chứng cảnh báo, một lớp hơn 50 sinh viên để kiểm tra phân trang và một lớp thứ hai cùng môn để kiểm tra cách ly dữ liệu. Kiểm cả đổi tên concept, sửa ngân hàng sau khi giao và truy nguyên một ô về đúng phiên bản bài.

## Hợp đồng API và quyền hai tầng

Các đường dẫn dưới đây là **đề xuất cho phần phát triển mới**, dùng tiền tố `/api/v1`. Các action đang có ưu tiên mở rộng contract hiện tại sau khi bảo toàn caller cũ. Sử dụng quyền hệ thống đã seed và kiểm quyền tài nguyên ở service. `ROLE_USER` có thể là giáo viên ở lớp này và sinh viên ở lớp khác. Mọi API kiểm context theo lớp và môn thực của tài nguyên.

| API / thao tác | Quyền hệ thống | Kiểm tra trong BE |
|---|---|---|
| `GET /courses/{courseId}/classwork-contexts` và `GET /classes/{classId}/courses/{courseId}/classwork` | `CLASS_VIEW`, cộng quyền đọc môn nơi áp dụng | Trả lớp được truy cập và khả năng thao tác. Student chỉ thấy bài đã giao trong lớp tham gia. |
| Lưu/sửa/công bố bài, liên kết bộ đề hoặc lịch thi | `ASSESSMENT_MANAGE` | Owner/Teacher trong lớp hoặc admin theo quyền hiện hành. Lớp đang hoạt động, môn thuộc lớp. |
| `GET /classes/{classId}/courses/{courseId}/gradebook` | `ASSESSMENT_MANAGE` | Owner/Teacher trong lớp hoặc admin. Báo cáo đúng phạm vi lớp–môn. |
| `GET /classes/{classId}/courses/{courseId}/gradebook/me` | `CLASS_VIEW` | Thành viên sinh viên đang hoạt động. Lấy user từ phiên đăng nhập, chỉ trả điểm được xem. |
| `POST /assessments/{id}/attempts`, lưu nháp và `POST /assessments/{id}/attempts/{attemptId}/submit` | `SUBMISSION_CREATE` | Đúng Student của lớp/môn, đúng lượt và đề, còn hiệu lực. Đọc lại lượt dùng `CLASS_VIEW` và giới hạn chủ lượt. |
| Chấm tay và `POST /exams/{id}/release-results` | `ASSESSMENT_MANAGE` | Owner/Teacher hoặc admin được phép, đủ điều kiện công bố, có audit. |
| Heatmap lớp, chi tiết ô và khoảng trống tri thức | `KNOWLEDGE_HEATMAP_VIEW` | Owner/Teacher xem lớp. Sinh viên đọc dữ liệu của mình. Khoảng trống cả lớp dành cho người có quyền quản lý. |

BE dùng DTO đã xác thực, lỗi chuẩn theo repo, và bổ sung test cho 401, 403, 404, 409. FE nhận diện lỗi quyền, dữ liệu chưa có, lỗi lưu và lỗi khôi phục. Hai bên cập nhật API spec, giữ fixture phản hồi đồng nhất với Java serialization, và dùng đúng định dạng `items` cho response phân trang.

## Cách giao việc và nghiệm thu chung

- **BE nhận trước** G1 schema/mapper, G2A contract lớp–môn và điểm, sau đó G2B bộ đề/lượt làm và G2C lịch/trả điểm. **FE nhận song song** G1 adapter và trạng thái lỗi, rồi G2A màn dùng chung. Trong G2B, BE hoàn tất các điều kiện công bố/nộp và FE hoàn tất màn làm bài trong cùng đợt tích hợp. Heatmap hoàn thiện từ chính dữ liệu tạo ra ở vòng đó.
- **QA có một bộ dữ liệu dùng lại** gồm hai lớp cùng môn, một giảng viên và ba sinh viên với kết quả đúng/sai/chưa làm. Test thực hiện bằng tài khoản từng vai trò, không giả lập thành công của API. Giữ ảnh hoặc log HTTP đã lược dữ liệu nhạy cảm cho ca chặn nghiệm thu.
- **Kiểm tra kỹ thuật** gồm compile và test BE, regression API với MySQL 8, typecheck FE, test parser/service và kiểm thử trình duyệt Desktop/Mobile cho các vai trò. Baseline UAT trước đó là TypeScript đạt, 2/9 tệp FE đạt, JUnit chạy riêng đạt 15/17. Lần triển khai cần ghi rõ kết quả mới theo từng gói, nhất là lỗi test cũ và lỗi chức năng tái hiện trực tiếp.

