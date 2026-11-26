import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';
import { getUserFriendlyErrorMessage } from '../error-utils';
import { ApiError } from '../../types/common';

test('intercepts ZodError and never leaks raw JSON schema errors to UI', () => {
  const schema = z.object({ createdAt: z.string(), updatedAt: z.string() });
  const parsed = schema.safeParse({ createdAt: null, updatedAt: null });
  assert.equal(parsed.success, false);

  const msg = getUserFriendlyErrorMessage(parsed.error, 'Tạo lớp học thất bại.');
  assert.equal(msg.includes('invalid_type'), false);
  assert.equal(msg.includes('createdAt'), false);
  assert.ok(msg.includes('Dữ liệu phản hồi'));
});

test('intercepts raw JSON error string and technical Network Error', () => {
  const rawJsonErr = new Error(
    '[{ "expected": "string", "code": "invalid_type", "path": ["createdAt"] }]'
  );
  assert.equal(
    getUserFriendlyErrorMessage(rawJsonErr, 'Lỗi tạo lớp.'),
    'Lỗi tạo lớp.'
  );

  const netErr = new Error('Network Error');
  assert.equal(
    getUserFriendlyErrorMessage(netErr, 'Không thể kết nối máy chủ.'),
    'Không thể kết nối máy chủ.'
  );
});

test('preserves clean business ApiError messages and maps HTTP 500 fallback', () => {
  const businessErr = new ApiError('Mã lớp học đã tồn tại.', 409, 409);
  assert.equal(
    getUserFriendlyErrorMessage(businessErr, 'Lỗi chung'),
    'Mã lớp học đã tồn tại.'
  );

  const serverErr = new ApiError('Request failed with status code 500', 500, 500);
  assert.equal(
    getUserFriendlyErrorMessage(serverErr, 'Lỗi chung'),
    'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
  );
});
