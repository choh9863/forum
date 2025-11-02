/**
 * IP 주소 마스킹 유틸리티
 * 개인정보 보호를 위해 IP 주소의 뒷부분을 마스킹합니다.
 * 예: 119.70.123.456 -> 119.70.***.***
 */

/**
 * IPv4 주소를 마스킹합니다.
 * 첫 두 옥텟만 남기고 나머지는 ***로 대체합니다.
 *
 * @param ip - 원본 IP 주소
 * @returns 마스킹된 IP 주소
 *
 * @example
 * maskIPv4('119.70.123.456') // Returns: '119.70.***.***'
 * maskIPv4('192.168.1.1') // Returns: '192.168.*.*'
 */
export function maskIPv4(ip: string): string {
  if (!ip) {
    return '***.***.***.***.';
  }

  // IPv4 형식 검증
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    console.warn(`Invalid IPv4 address format: ${ip}`);
    return '***.***.***.***.';
  }

  const parts = ip.split('.');

  // 첫 두 옥텟만 유지하고 나머지는 마스킹
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***.`;
  }

  return '***.***.***.***.';
}

/**
 * IPv6 주소를 마스킹합니다.
 * 첫 두 세그먼트만 남기고 나머지는 ****로 대체합니다.
 *
 * @param ip - 원본 IPv6 주소
 * @returns 마스킹된 IPv6 주소
 *
 * @example
 * maskIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
 * // Returns: '2001:0db8:****:****:****:****:****:****'
 */
export function maskIPv6(ip: string): string {
  if (!ip) {
    return '****:****:****:****:****:****:****:****';
  }

  // IPv6 형식 검증 (간단한 버전)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (!ipv6Regex.test(ip)) {
    console.warn(`Invalid IPv6 address format: ${ip}`);
    return '****:****:****:****:****:****:****:****';
  }

  const parts = ip.split(':');

  // 첫 두 세그먼트만 유지하고 나머지는 마스킹
  if (parts.length >= 2) {
    const masked = [parts[0], parts[1]];
    for (let i = 2; i < 8; i++) {
      masked.push('****');
    }
    return masked.join(':');
  }

  return '****:****:****:****:****:****:****:****';
}

/**
 * IP 주소를 자동으로 감지하여 마스킹합니다.
 * IPv4와 IPv6를 모두 지원합니다.
 *
 * @param ip - 원본 IP 주소 (IPv4 또는 IPv6)
 * @returns 마스킹된 IP 주소
 *
 * @example
 * maskIP('119.70.123.456') // Returns: '119.70.***.***'
 * maskIP('2001:0db8:85a3::7334') // Returns: '2001:0db8:****:****:****:****:****:****'
 * maskIP('::1') // Returns: '****:****:****:****:****:****:****:****'
 */
export function maskIP(ip: string): string {
  if (!ip) {
    return '***.***.***.***.';
  }

  // IPv6 주소인지 확인 (콜론 포함 여부로 간단히 판단)
  if (ip.includes(':')) {
    return maskIPv6(ip);
  }

  // IPv4로 처리
  return maskIPv4(ip);
}

/**
 * Express Request 객체에서 실제 클라이언트 IP를 추출하고 마스킹합니다.
 * 프록시나 로드 밸런서를 통과한 경우에도 올바른 IP를 가져옵니다.
 *
 * @param req - Express Request 객체
 * @returns 마스킹된 IP 주소
 */
export function getAndMaskClientIP(req: any): string {
  // X-Forwarded-For 헤더 확인 (프록시를 통한 경우)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // 여러 프록시를 거친 경우 첫 번째 IP가 실제 클라이언트 IP
    const ips = (forwardedFor as string).split(',');
    const clientIP = ips[0].trim();
    return maskIP(clientIP);
  }

  // X-Real-IP 헤더 확인
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return maskIP(realIP as string);
  }

  // 직접 연결된 경우
  const remoteAddress = req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || req.connection?.socket?.remoteAddress;

  if (remoteAddress) {
    // IPv6 로컬호스트 주소를 IPv4로 변환
    if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') {
      return maskIP('127.0.0.1');
    }

    // IPv4-mapped IPv6 주소 처리 (::ffff:192.0.2.1 형식)
    if (remoteAddress.startsWith('::ffff:')) {
      const ipv4 = remoteAddress.substring(7);
      return maskIP(ipv4);
    }

    return maskIP(remoteAddress);
  }

  // IP를 가져올 수 없는 경우
  return '***.***.***.***.';
}

/**
 * 마스킹된 IP 주소인지 확인합니다.
 *
 * @param ip - 확인할 IP 주소
 * @returns 마스킹된 IP인 경우 true
 */
export function isMaskedIP(ip: string): boolean {
  return ip.includes('***') || ip.includes('****');
}
