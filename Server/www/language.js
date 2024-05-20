
var stampStatus = [{
    "en": "Enjoy our journey <br> and collect 3 stamps <br> for a brand goods!",
    "kr": "여행을 즐기고 <br> 브랜드 상품에 대한 <br> 스탬프 3개를 수집하세요!",
    "fr": "여행을 즐기고 <br> 브랜드 상품에 대한 <br> 스탬프 3개를 수집하세요!",
    "jp": "여행을 즐기고 <br> 브랜드 상품에 대한 <br> 스탬프 3개를 수집하세요!",
    "ch": "여행을 즐기고 <br> 브랜드 상품에 대한 <br> 스탬프 3개를 수집하세요!",
}, {
    "en": "Only two stamps left!",
    "kr": "단 두개의 스탬프만 남았어요!",
    "fr": "단 두개의 스탬프만 남았어요!",
    "jp": "단 두개의 스탬프만 남았어요!",
    "ch": "단 두개의 스탬프만 남았어요!",
}, {
    "en": "Only one stamps left!",
    "kr": "단 한개의 스탬프만 남았어요!",
    "fr": "단 한개의 스탬프만 남았어요!",
    "jp": "단 한개의 스탬프만 남았어요!",
    "ch": "단 한개의 스탬프만 남았어요!",
}, {
    "en": "Bravo! <br> Show this screen <br> at the goods station.",
    "kr": "축하합니다! <br> 상품 스테이션에서 <br> 이 화면을 보여주세요!",
    "fr": "축하합니다! <br> 상품 스테이션에서 <br> 이 화면을 보여주세요!",
    "jp": "축하합니다! <br> 상품 스테이션에서 <br> 이 화면을 보여주세요!",
    "ch": "축하합니다! <br> 상품 스테이션에서 <br> 이 화면을 보여주세요!",
}];

var translations = {
    "en": 
    {
        "greeting": `Welcome to 
                    Galaxy Experience Space
                    `,

        "stamp_title": `Galaxy AI` + starImage + `is here`
        ,

        "stamp_status": stampStatus[Number(localStorage.getItem("stampStatus"))]["en"],

        "agreement" : `

        <p>Hello, we are committed to protecting your personal information. Below are the terms and conditions regarding the collection of your email address.</p>
        <ol>
          <li><strong>Personal Information Collected:</strong> Email address</li>
          <li><strong>Purposes of Collection and Use:</strong>
            <ul>
              <li>Service provision and management</li>
              <li>Notification of service-related announcements and information</li>
              <li>Participation and notification of events, promotions, surveys, etc.</li>
            </ul>
          </li>
          <li><strong>Retention Period:</strong> Personal information will be retained for the period necessary to fulfill the purposes outlined above.</li>
          <li><strong>Provision and Sharing of Personal Information:</strong> Personal information will not be provided to third parties unless required by law or with your consent.</li>
          <li><strong>Access, Correction, and Deletion:</strong> You have the right to access, correct, or delete your personal information.</li>
          <li><strong>Withdrawal of Consent:</strong> You have the right to withdraw your consent for the collection and use of personal information, which may result in restrictions on service usage.</li>
          <li><strong>Other:</strong> This agreement may be revised at any time, with changes announced on the website.</li>
        </ol>
        <p>If you agree to the above terms and conditions, please click the "Agree" button below. If you do not agree, your service usage may be restricted.</p>
        `
        ,
        "farewell": "Goodbye",
        "welcomeMessage": "Welcome to our website!"
    },
    "kr" : 
    {
        "greeting": "축하합니다!",

        "stamp_title": `여기에 Galaxy AI ` + starImage + `가 있습니다.
        `,

        "stamp_status": stampStatus[Number(localStorage.getItem("stampStatus"))]["kr"],

        "agreement" : `
        
<p>안녕하세요, 우리는 개인정보 보호에 최선을 다하고 있습니다. 이메일 주소 수집에 관한 약관 및 조건을 아래에 안내드립니다.</p>
<ol>
  <li><strong>수집되는 개인정보:</strong> 이메일 주소</li>
  <li><strong>수집 및 이용 목적:</strong>
    <ul>
      <li>서비스 제공 및 관리</li>
      <li>서비스 관련 공지 및 정보 통지</li>
      <li>이벤트, 프로모션, 설문조사 등에 대한 참여 및 통지</li>
    </ul>
  </li>
  <li><strong>보유 기간:</strong> 개인정보는 상기 목적을 달성하기 위한 기간 동안 보관됩니다.</li>
  <li><strong>개인정보 제공 및 공유:</strong> 개인정보는 법령에 따른 경우나 귀하의 동의 없이 제3자에게 제공되지 않습니다.</li>
  <li><strong>접근, 수정 및 삭제:</strong> 귀하는 개인정보에 대한 접근, 수정 또는 삭제를 요청할 수 있습니다.</li>
  <li><strong>동의 철회:</strong> 개인정보 수집 및 이용에 대한 동의를 철회할 수 있으며, 이는 서비스 이용에 제한을 초래할 수 있습니다.</li>
  <li><strong>기타:</strong> 본 약관은 웹사이트에서 공지된 변경사항이 있을 경우 언제든지 수정될 수 있습니다.</li>
</ol>
<p>위의 약관 및 조건에 동의하실 경우 아래의 "동의" 버튼을 클릭해주세요. 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
        `
        ,
        "farewell": "안녕히 가세요",
        "welcomeMessage": "우리 웹사이트에 오신 것을 환영합니다!"
    },
    "fr" : 
    {
        "greeting": "Bonjour",

        "stamp_title": `여기에 Galaxy AI ` + starImage + `가 있습니다.
        `,
        
        "stamp_status": stampStatus[Number(localStorage.getItem("stampStatus"))][localStorage.getItem("language")],

        "agreement" : `
        <p>Hello, we are committed to protecting your personal information. Below are the terms and conditions regarding the collection of your email address.</p>
        <ol>
          <li><strong>Personal Information Collected:</strong> Email address</li>
          <li><strong>Purposes of Collection and Use:</strong>
            <ul>
              <li>Service provision and management</li>
              <li>Notification of service-related announcements and information</li>
              <li>Participation and notification of events, promotions, surveys, etc.</li>
            </ul>
          </li>
          <li><strong>Retention Period:</strong> Personal information will be retained for the period necessary to fulfill the purposes outlined above.</li>
          <li><strong>Provision and Sharing of Personal Information:</strong> Personal information will not be provided to third parties unless required by law or with your consent.</li>
          <li><strong>Access, Correction, and Deletion:</strong> You have the right to access, correct, or delete your personal information.</li>
          <li><strong>Withdrawal of Consent:</strong> You have the right to withdraw your consent for the collection and use of personal information, which may result in restrictions on service usage.</li>
          <li><strong>Other:</strong> This agreement may be revised at any time, with changes announced on the website.</li>
        </ol>
        <p>If you agree to the above terms and conditions, please click the "Agree" button below. If you do not agree, your service usage may be restricted.</p>
        `
        ,
        "farewell": "Au revoir",
        "welcomeMessage": "Bienvenue sur notre site web !"
    },  
    "jp" : 
    {
        "greeting": "こんにちは",
        
        "stamp_title": `여기에 Galaxy AI ` + starImage + `가 있습니다.
        `,
        
        "stamp_status": stampStatus[Number(localStorage.getItem("stampStatus"))][localStorage.getItem("language")],

        "agreement" : `
        <p>Hello, we are committed to protecting your personal information. Below are the terms and conditions regarding the collection of your email address.</p>
        <ol>
          <li><strong>Personal Information Collected:</strong> Email address</li>
          <li><strong>Purposes of Collection and Use:</strong>
            <ul>
              <li>Service provision and management</li>
              <li>Notification of service-related announcements and information</li>
              <li>Participation and notification of events, promotions, surveys, etc.</li>
            </ul>
          </li>
          <li><strong>Retention Period:</strong> Personal information will be retained for the period necessary to fulfill the purposes outlined above.</li>
          <li><strong>Provision and Sharing of Personal Information:</strong> Personal information will not be provided to third parties unless required by law or with your consent.</li>
          <li><strong>Access, Correction, and Deletion:</strong> You have the right to access, correct, or delete your personal information.</li>
          <li><strong>Withdrawal of Consent:</strong> You have the right to withdraw your consent for the collection and use of personal information, which may result in restrictions on service usage.</li>
          <li><strong>Other:</strong> This agreement may be revised at any time, with changes announced on the website.</li>
        </ol>
        <p>If you agree to the above terms and conditions, please click the "Agree" button below. If you do not agree, your service usage may be restricted.</p>
        `
        ,
        "farewell": "さようなら",
        "welcomeMessage": "私たちのウェブサイトへようこそ！"
    }, 
    "ch" : 
    {
        "greeting": "你好",
        
        "stamp_title": `여기에 Galaxy AI ` + starImage + `가 있습니다.
        `,
        
        "stamp_status": stampStatus[Number(localStorage.getItem("stampStatus"))][localStorage.getItem("language")],

        "agreement" : `
        <p>Hello, we are committed to protecting your personal information. Below are the terms and conditions regarding the collection of your email address.</p>
        <ol>
          <li><strong>Personal Information Collected:</strong> Email address</li>
          <li><strong>Purposes of Collection and Use:</strong>
            <ul>
              <li>Service provision and management</li>
              <li>Notification of service-related announcements and information</li>
              <li>Participation and notification of events, promotions, surveys, etc.</li>
            </ul>
          </li>
          <li><strong>Retention Period:</strong> Personal information will be retained for the period necessary to fulfill the purposes outlined above.</li>
          <li><strong>Provision and Sharing of Personal Information:</strong> Personal information will not be provided to third parties unless required by law or with your consent.</li>
          <li><strong>Access, Correction, and Deletion:</strong> You have the right to access, correct, or delete your personal information.</li>
          <li><strong>Withdrawal of Consent:</strong> You have the right to withdraw your consent for the collection and use of personal information, which may result in restrictions on service usage.</li>
          <li><strong>Other:</strong> This agreement may be revised at any time, with changes announced on the website.</li>
        </ol>
        <p>If you agree to the above terms and conditions, please click the "Agree" button below. If you do not agree, your service usage may be restricted.</p>
        `
        ,
        "farewell": "再见",
        "welcomeMessage": "欢迎来到我们的网站！"
    }
}

