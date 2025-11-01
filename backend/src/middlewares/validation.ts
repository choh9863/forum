/**
 * Validation Middleware
 * express-validator를 사용한 Request 유효성 검증
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * 유효성 검증 결과를 확인하고 에러가 있으면 응답을 반환합니다.
 *
 * @example
 * router.post('/register',
 *   [
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 8 })
 *   ],
 *   validate,
 *   registerController
 * );
 */
export function validate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 에러를 보기 좋게 포맷팅
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
    });
    return;
  }

  next();
}

/**
 * 유효성 검증 체인을 실행하고 결과를 확인하는 미들웨어를 생성합니다.
 * ValidationChain 배열을 받아서 하나의 미들웨어로 합칩니다.
 *
 * @param validations - ValidationChain 배열
 * @returns 미들웨어 배열
 *
 * @example
 * router.post('/register',
 *   validateRequest([
 *     body('email').isEmail().withMessage('Invalid email format'),
 *     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
 *   ]),
 *   registerController
 * );
 */
export function validateRequest(validations: ValidationChain[]) {
  return [
    ...validations,
    validate,
  ];
}

/**
 * 조건부 유효성 검증
 * 특정 조건이 만족될 때만 유효성 검증을 실행합니다.
 *
 * @param condition - 검증 실행 조건 함수
 * @param validations - ValidationChain 배열
 * @returns 미들웨어 배열
 */
export function conditionalValidation(
  condition: (req: Request) => boolean,
  validations: ValidationChain[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      // 조건이 참이면 유효성 검증 실행
      for (const validation of validations) {
        await validation.run(req);
      }
    }
    next();
  };
}

/**
 * 커스텀 에러 메시지를 포함한 유효성 검증 미들웨어
 *
 * @param customErrorMessage - 커스텀 에러 메시지
 */
export function validateWithCustomMessage(customErrorMessage?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error: any) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      }));

      res.status(422).json({
        success: false,
        error: customErrorMessage || 'Validation failed',
        details: formattedErrors,
      });
      return;
    }

    next();
  };
}
