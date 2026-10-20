# 짝 고르는 규칙 12

핀터레스트·웹의 폰트 짝 예시와, 모션그래픽 디자이너가 클로드 결과물을 반려하면서 정한 기준을 합친 거예요.

1. **반대끼리 짝** — 굵은 ↔ 가는, 고딕 ↔ 세리프·필기체·손글씨. 성격이 비슷한 둘은 짝이 안 보여요.
2. **같은 종류끼리는 피하기** — 세리프+세리프, 필기체+필기체, 손글씨+손글씨는 서로 부딪혀요.
3. **한 화면에 폰트 3개까지** — 제목(개성) · 포인트 · 본문(담백). 4개부터는 산만해요.
4. **짝은 제목 안에서 보이게** — 한 폰트가 작은 글자에만 있으면 무엇끼리 짝인지 티가 안 나요. 제목 안에서 낱말 단위로 섞거나, 위아래 줄로 나눠요.
5. **숫자·영어는 영문 폰트로** — 한글 폰트 속 영문·숫자는 대체로 약해요. 가격·날짜·영어 낱말은 짝 영문 폰트로.
6. **본문은 담백하게** — 개성은 제목에서만. 본문은 프리텐다드·수트 같은 기본 고딕 Light~Regular.
7. **크기 대비는 크게** — 제목은 본문의 3배 이상. 어중간한 중간 크기를 여러 개 만들지 않아요.
8. **큰 제목은 자간을 좁게** — −2% ~ −5%. 영어 대문자 라벨에 자간을 넓게 벌리지 않아요(대표적인 AI 티).
9. **필기체·손글씨는 한두 낱말만** — 긴 문장은 읽히지 않아요.
10. **강조 형광펜은 소문자 몸통만** — 영어 낱말을 칠할 땐 위아래로 긴 획(f·t·d·p·y)은 빼고 x높이만. 한글은 글자 높이만.
11. **레퍼런스를 따라 할 땐 디자인과 색을 같이 가져오지 않기** — 색이 가장 큰 표절 힌트예요. 배치는 문법만 빌리고, 색은 새로 고르세요.
12. **폰트 파일은 결과물에 넣지 않기** — 설치 링크와 웹폰트 주소만. 폰트 파일 재배포가 금지된 폰트가 있어요.

## 형광펜 CSS(규칙 10)
```html
<span class="xhl" data-xhl="#ffb070">perfect</span>
<script>
document.fonts.ready.then(()=>document.querySelectorAll('[data-xhl]').forEach(e=>{
  const cs=getComputedStyle(e), c=document.createElement('canvas').getContext('2d');
  c.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
  const xh=c.measureText('x').actualBoundingBoxAscent, S=parseFloat(cs.fontSize);
  e.style.display='inline-block'; e.style.position='relative';
  const m=document.createElement('span'); m.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline'; e.appendChild(m);
  const base=m.offsetTop; m.remove(); const t=base-xh-.05*S, b=base+.07*S, col=e.dataset.xhl;
  e.style.background=`linear-gradient(transparent ${t}px,${col} ${t}px,${col} ${b}px,transparent ${b}px)`;
}));
</script>
```
