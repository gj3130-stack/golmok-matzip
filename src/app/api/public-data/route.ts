import { NextResponse } from 'next/server';

/**
 * 공공데이터포털 음식점 데이터 수집 및 연동 엔드포인트
 * 
 * [주의] 규칙 준수: 외부 API 주소와 파라미터/응답 필드는 임의로 추측하지 않습니다.
 * 사용자가 공공데이터포털에서 신청하신 정확한 API 엔드포인트(예: 소상공인 상가정보, 안심식당 등)를
 * 제공해주시면 이곳에 연동 로직이 완성됩니다.
 */
export async function GET(request: Request) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: '공공데이터포털 API 키(DATA_GO_KR_API_KEY)가 설정되지 않았습니다.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'ready_for_spec',
    message: '공공데이터포털 인증키가 .env.local에 정상 등록되었습니다. 활용신청하신 공공데이터의 정확한 엔드포인트 URL 및 요청 파라미터 명세를 알려주시면 실시간 데이터 파이프라인이 즉시 연결됩니다.',
    keyPreview: `${apiKey.slice(0, 6)}...${apiKey.slice(-6)}`,
  });
}
