/* =========================================================
   NEXUS i18n — lightweight translation system
   No external dependencies. Reads from localStorage.
   Human-reviewed strings for ES, ZH, VI, PT, FR, AR.
   ========================================================= */

export type LangCode = 'en' | 'es' | 'zh' | 'vi' | 'pt' | 'fr' | 'ar' | 'ko' | 'tl' | 'ru' | 'hi' | 'am'

export type TranslationKey =
  /* Nav — anchor section links */
  | 'nav.features'
  | 'nav.howItWorks'
  | 'nav.eligibility'
  /* Nav — app page links */
  | 'nav.search'
  | 'nav.programs'
  | 'nav.rights'
  | 'nav.stories'
  | 'nav.advocacy'
  | 'nav.chw'
  | 'nav.pathways'
  | 'nav.impact'
  | 'nav.outcomes'
  | 'nav.calendar'
  | 'nav.provider'
  | 'nav.methodology'
  /* Nav — auth & account actions */
  | 'nav.signIn'
  | 'nav.getStarted'
  | 'nav.signOut'
  | 'nav.saved'
  | 'nav.login'
  | 'nav.dashboard'
  | 'nav.logout'
  /* Mobile dock — short labels */
  | 'dock.search'
  /* Home hero */
  | 'home.hero.badge'
  | 'home.hero.headline'
  | 'home.hero.subheadline'
  | 'home.hero.cta'
  | 'home.hero.secondary'
  | 'home.hero.zipPlaceholder'
  /* Search */
  | 'search.placeholder'
  | 'search.locationPlaceholder'
  | 'search.button'
  | 'search.enterZip'
  | 'search.enterZipDesc'
  | 'search.noResults'
  | 'search.noResultsHint'
  | 'search.clinicsNear'
  | 'search.clinic'
  | 'search.clinics'
  | 'search.openNow'
  | 'search.closed'
  | 'search.accepting'
  | 'search.findClinic'
  | 'search.viewDetails'
  | 'search.call'
  | 'search.visit'
  | 'search.directions'
  | 'search.bookmark'
  | 'search.bookmarked'
  | 'search.swipeHint'
  /* Programs */
  | 'programs.headline'
  | 'programs.subheadline'
  | 'programs.checkEligibility'
  | 'programs.annualIncome'
  | 'programs.householdSize'
  | 'programs.checkButton'
  | 'programs.youMayQualify'
  | 'programs.noMatch'
  | 'programs.savingsHeadline'
  /* Rights */
  | 'rights.headline'
  | 'rights.subheadline'
  | 'rights.emtala'
  | 'rights.ada'
  | 'rights.hipaa'
  | 'rights.titlevi'
  /* Emergency — trigger & panel chrome */
  | 'emergency.title'
  | 'emergency.helpNow'
  | 'emergency.helpNowCompact'
  | 'emergency.immediateOptions'
  | 'emergency.freeNote'
  /* Emergency — resource labels */
  | 'emergency.call911'
  | 'emergency.findER'
  | 'emergency.call988'
  | 'emergency.crisisText'
  | 'emergency.crisis'
  | 'emergency.poison'
  /* Emergency — resource descriptions */
  | 'emergency.desc.911'
  | 'emergency.desc.er'
  | 'emergency.desc.988'
  | 'emergency.desc.crisisText'
  | 'emergency.desc.poison'
  /* General */
  | 'general.learnMore'
  | 'general.close'
  | 'general.loading'
  | 'general.error'
  | 'general.save'
  | 'general.submit'
  | 'general.back'
  | 'general.next'
  | 'general.free'
  | 'general.slidingScale'
  | 'general.noInsuranceRequired'

type Translations = Record<TranslationKey, string>

const EN: Translations = {
  /* Nav — anchor section links */
  'nav.features':     'Features',
  'nav.howItWorks':   'How it works',
  'nav.eligibility':  'Eligibility',
  /* Nav — app page links */
  'nav.search':       'Find a clinic',
  'nav.programs':     'Programs',
  'nav.rights':       'Your rights',
  'nav.stories':      'Stories',
  'nav.advocacy':     'Advocacy',
  'nav.chw':          'CHW',
  'nav.pathways':     'Pathways',
  'nav.impact':       'Impact',
  'nav.outcomes':     'Outcomes',
  'nav.calendar':     'Calendar',
  'nav.provider':     'Provider',
  'nav.methodology':  'Methodology',
  /* Nav — auth & account actions */
  'nav.signIn':       'Sign in',
  'nav.getStarted':   'Get started',
  'nav.signOut':      'Sign out',
  'nav.saved':        'Saved',
  'nav.login':        'Log in',
  'nav.dashboard':    'Dashboard',
  'nav.logout':       'Log out',
  /* Mobile dock */
  'dock.search':      'Search',

  'home.hero.badge':          '30M uninsured Americans deserve better',
  'home.hero.headline':       'Free healthcare.\nFound in seconds.',
  'home.hero.subheadline':    'NEXUS finds free clinics, sliding-scale care, and hidden programs near you — no insurance required.',
  'home.hero.cta':            'Find free care near me',
  'home.hero.secondary':      'Learn how it works',
  'home.hero.zipPlaceholder': 'Enter ZIP or city…',

  'search.placeholder':       'Symptom, specialty, or "free dental phoenix"…',
  'search.locationPlaceholder': 'ZIP or city…',
  'search.button':            'Search',
  'search.enterZip':          'Enter your ZIP code',
  'search.enterZipDesc':      'We pull from HRSA, NAFC, and community directories to find free and sliding-scale clinics near you.',
  'search.noResults':         'No clinics found near',
  'search.noResultsHint':     'Try a larger radius or remove the specialty filter',
  'search.clinicsNear':       'clinics near',
  'search.clinic':            'clinic',
  'search.clinics':           'clinics',
  'search.openNow':           'Open now',
  'search.closed':            'Closed',
  'search.accepting':         'Accepting patients',
  'search.findClinic':        'Find a clinic',
  'search.viewDetails':       'View full details',
  'search.call':              'Call',
  'search.visit':             'Visit',
  'search.directions':        'Directions',
  'search.bookmark':          'Bookmark clinic',
  'search.bookmarked':        'Bookmarked',
  'search.swipeHint':         'Swipe right to save · left to dismiss',

  'programs.headline':        'You may qualify for more than you think',
  'programs.subheadline':     'Check your eligibility for Medicaid, ACA plans, patient assistance, and more.',
  'programs.checkEligibility': 'Check eligibility',
  'programs.annualIncome':    'Annual household income',
  'programs.householdSize':   'Household size',
  'programs.checkButton':     'Check my eligibility',
  'programs.youMayQualify':   'You may qualify for',
  'programs.noMatch':         'No exact matches — but free clinics are always available.',
  'programs.savingsHeadline': 'Potential annual savings',

  'rights.headline':          'Know your rights as a patient',
  'rights.subheadline':       'These are federal laws — hospitals and clinics must follow them, no matter your immigration status or insurance.',
  'rights.emtala':            'Emergency care cannot be denied',
  'rights.ada':               'You cannot be discriminated against for a disability',
  'rights.hipaa':             'Your medical information is private',
  'rights.titlevi':           'You have the right to an interpreter',

  /* Emergency chrome */
  'emergency.title':              'Need immediate help?',
  'emergency.helpNow':            'I need help now',
  'emergency.helpNowCompact':     'Help Now',
  'emergency.immediateOptions':   'Immediate Options',
  'emergency.freeNote':           'All resources are free. No insurance or ID required.',
  /* Emergency resource labels */
  'emergency.call911':            'Call 911',
  'emergency.findER':             'Find Emergency Room',
  'emergency.call988':            'Call or Text 988',
  'emergency.crisisText':         'Crisis Text Line',
  'emergency.crisis':             '988 Crisis Line',
  'emergency.poison':             'Poison Control',
  /* Emergency resource descriptions */
  'emergency.desc.911':           'Life-threatening emergency',
  'emergency.desc.er':            'Nearest ER, sorted by distance',
  'emergency.desc.988':           'Suicide & Crisis Lifeline — free, 24/7',
  'emergency.desc.crisisText':    'Text HOME to 741741 — free, 24/7',
  'emergency.desc.poison':        '1-800-222-1222 — free, 24/7',

  'general.learnMore':            'Learn more',
  'general.close':                'Close',
  'general.loading':              'Loading…',
  'general.error':                'Something went wrong. Please try again.',
  'general.save':                 'Save',
  'general.submit':               'Submit',
  'general.back':                 'Back',
  'general.next':                 'Next',
  'general.free':                 'Free',
  'general.slidingScale':         'Sliding scale',
  'general.noInsuranceRequired':  'No insurance required',
}

const ES: Translations = {
  /* Nav — anchor section links */
  'nav.features':     'Características',
  'nav.howItWorks':   'Cómo funciona',
  'nav.eligibility':  'Elegibilidad',
  /* Nav — app page links */
  'nav.search':       'Buscar clínica',
  'nav.programs':     'Programas',
  'nav.rights':       'Tus derechos',
  'nav.stories':      'Historias',
  'nav.advocacy':     'Activismo',
  'nav.chw':          'Promotores',
  'nav.pathways':     'Rutas',
  'nav.impact':       'Impacto',
  'nav.outcomes':     'Resultados',
  'nav.calendar':     'Calendario',
  'nav.provider':     'Proveedor',
  'nav.methodology':  'Metodología',
  /* Nav — auth & account actions */
  'nav.signIn':       'Iniciar sesión',
  'nav.getStarted':   'Empezar',
  'nav.signOut':      'Cerrar sesión',
  'nav.saved':        'Guardado',
  'nav.login':        'Iniciar sesión',
  'nav.dashboard':    'Panel',
  'nav.logout':       'Cerrar sesión',
  /* Mobile dock */
  'dock.search':      'Buscar',

  'home.hero.badge':          '30 millones de estadounidenses sin seguro merecen mejor',
  'home.hero.headline':       'Atención médica gratuita.\nEncontrada en segundos.',
  'home.hero.subheadline':    'NEXUS encuentra clínicas gratuitas, atención por escala móvil y programas ocultos cerca de ti — sin seguro necesario.',
  'home.hero.cta':            'Encontrar atención gratuita',
  'home.hero.secondary':      'Cómo funciona',
  'home.hero.zipPlaceholder': 'Código postal o ciudad…',

  'search.placeholder':       'Síntoma, especialidad o "dental gratis phoenix"…',
  'search.locationPlaceholder': 'Código postal o ciudad…',
  'search.button':            'Buscar',
  'search.enterZip':          'Ingresa tu código postal',
  'search.enterZipDesc':      'Buscamos en HRSA, NAFC y directorios comunitarios para encontrar clínicas gratuitas y por escala móvil cerca de ti.',
  'search.noResults':         'No se encontraron clínicas cerca de',
  'search.noResultsHint':     'Prueba un radio más amplio o elimina el filtro de especialidad',
  'search.clinicsNear':       'clínicas cerca de',
  'search.clinic':            'clínica',
  'search.clinics':           'clínicas',
  'search.openNow':           'Abierto ahora',
  'search.closed':            'Cerrado',
  'search.accepting':         'Aceptando pacientes',
  'search.findClinic':        'Buscar clínica',
  'search.viewDetails':       'Ver detalles completos',
  'search.call':              'Llamar',
  'search.visit':             'Visitar',
  'search.directions':        'Cómo llegar',
  'search.bookmark':          'Guardar clínica',
  'search.bookmarked':        'Guardada',
  'search.swipeHint':         'Desliza derecha para guardar · izquierda para descartar',

  'programs.headline':        'Puedes calificar para más de lo que piensas',
  'programs.subheadline':     'Verifica tu elegibilidad para Medicaid, planes ACA, asistencia al paciente y más.',
  'programs.checkEligibility': 'Verificar elegibilidad',
  'programs.annualIncome':    'Ingreso familiar anual',
  'programs.householdSize':   'Tamaño del hogar',
  'programs.checkButton':     'Verificar mi elegibilidad',
  'programs.youMayQualify':   'Podrías calificar para',
  'programs.noMatch':         'Sin coincidencias exactas — pero las clínicas gratuitas siempre están disponibles.',
  'programs.savingsHeadline': 'Ahorros anuales potenciales',

  'rights.headline':          'Conoce tus derechos como paciente',
  'rights.subheadline':       'Estas son leyes federales — hospitales y clínicas deben cumplirlas, sin importar tu estatus migratorio o seguro.',
  'rights.emtala':            'No se puede negar atención de emergencia',
  'rights.ada':               'No puedes ser discriminado por una discapacidad',
  'rights.hipaa':             'Tu información médica es privada',
  'rights.titlevi':           'Tienes derecho a un intérprete',

  'emergency.title':              '¿Necesitas ayuda inmediata?',
  'emergency.helpNow':            'Necesito ayuda ahora',
  'emergency.helpNowCompact':     'Ayuda ya',
  'emergency.immediateOptions':   'Opciones inmediatas',
  'emergency.freeNote':           'Todos los recursos son gratuitos. No se requiere seguro ni identificación.',
  'emergency.call911':            'Llamar al 911',
  'emergency.findER':             'Encontrar sala de emergencias',
  'emergency.call988':            'Llamar o enviar SMS al 988',
  'emergency.crisisText':         'Línea de texto de crisis',
  'emergency.crisis':             'Línea de Crisis 988',
  'emergency.poison':             'Control de Envenenamiento',
  'emergency.desc.911':           'Emergencia que pone en peligro la vida',
  'emergency.desc.er':            'Sala de emergencias más cercana, ordenada por distancia',
  'emergency.desc.988':           'Línea de crisis — gratis, 24/7',
  'emergency.desc.crisisText':    'Envía HOLA al 741741 — gratis, 24/7',
  'emergency.desc.poison':        '1-800-222-1222 — gratis, 24/7',

  'general.learnMore':            'Saber más',
  'general.close':                'Cerrar',
  'general.loading':              'Cargando…',
  'general.error':                'Algo salió mal. Por favor intenta de nuevo.',
  'general.save':                 'Guardar',
  'general.submit':               'Enviar',
  'general.back':                 'Atrás',
  'general.next':                 'Siguiente',
  'general.free':                 'Gratuito',
  'general.slidingScale':         'Escala móvil',
  'general.noInsuranceRequired':  'No se requiere seguro',
}

const ZH: Translations = {
  /* Nav — anchor section links */
  'nav.features':     '功能',
  'nav.howItWorks':   '使用方式',
  'nav.eligibility':  '资格',
  /* Nav — app page links */
  'nav.search':       '查找诊所',
  'nav.programs':     '项目',
  'nav.rights':       '您的权利',
  'nav.stories':      '故事',
  'nav.advocacy':     '倡导',
  'nav.chw':          '社区健康工作者',
  'nav.pathways':     '路径',
  'nav.impact':       '影响',
  'nav.outcomes':     '结果',
  'nav.calendar':     '日历',
  'nav.provider':     '提供者',
  'nav.methodology':  '方法论',
  /* Nav — auth & account actions */
  'nav.signIn':       '登录',
  'nav.getStarted':   '开始使用',
  'nav.signOut':      '退出',
  'nav.saved':        '已保存',
  'nav.login':        '登录',
  'nav.dashboard':    '仪表板',
  'nav.logout':       '退出',
  /* Mobile dock */
  'dock.search':      '搜索',

  'home.hero.badge':          '3000万无保险美国人值得更好的医疗',
  'home.hero.headline':       '免费医疗。\n秒速找到。',
  'home.hero.subheadline':    'NEXUS 为您在附近找到免费诊所、阶梯收费医疗和隐藏项目 — 无需保险。',
  'home.hero.cta':            '查找附近免费医疗',
  'home.hero.secondary':      '了解运作方式',
  'home.hero.zipPlaceholder': '输入邮编或城市…',

  'search.placeholder':       '症状、专科或"免费牙科凤凰城"…',
  'search.locationPlaceholder': '邮编或城市…',
  'search.button':            '搜索',
  'search.enterZip':          '输入您的邮编',
  'search.enterZipDesc':      '我们从HRSA、NAFC和社区目录中搜索您附近的免费和阶梯收费诊所。',
  'search.noResults':         '附近未找到诊所：',
  'search.noResultsHint':     '尝试更大半径或删除专科过滤器',
  'search.clinicsNear':       '附近的诊所',
  'search.clinic':            '诊所',
  'search.clinics':           '诊所',
  'search.openNow':           '现在开放',
  'search.closed':            '已关闭',
  'search.accepting':         '接受新患者',
  'search.findClinic':        '查找诊所',
  'search.viewDetails':       '查看完整信息',
  'search.call':              '拨打',
  'search.visit':             '访问',
  'search.directions':        '导航',
  'search.bookmark':          '收藏诊所',
  'search.bookmarked':        '已收藏',
  'search.swipeHint':         '右滑保存 · 左滑忽略',

  'programs.headline':        '您可能符合更多资格',
  'programs.subheadline':     '查看您是否符合Medicaid、ACA计划、患者援助等资格。',
  'programs.checkEligibility': '检查资格',
  'programs.annualIncome':    '家庭年收入',
  'programs.householdSize':   '家庭人数',
  'programs.checkButton':     '检查我的资格',
  'programs.youMayQualify':   '您可能符合',
  'programs.noMatch':         '没有精确匹配 — 但免费诊所始终可用。',
  'programs.savingsHeadline': '潜在年度节省',

  'rights.headline':          '了解您作为患者的权利',
  'rights.subheadline':       '这些是联邦法律 — 无论您的移民身份或保险状况，医院和诊所必须遵守。',
  'rights.emtala':            '不得拒绝急诊护理',
  'rights.ada':               '不得因残疾而受到歧视',
  'rights.hipaa':             '您的医疗信息是私密的',
  'rights.titlevi':           '您有权获得口译员',

  'emergency.title':              '需要立即帮助？',
  'emergency.helpNow':            '我需要立即帮助',
  'emergency.helpNowCompact':     '立即帮助',
  'emergency.immediateOptions':   '立即选项',
  'emergency.freeNote':           '所有资源均免费。无需保险或身份证。',
  'emergency.call911':            '拨打911',
  'emergency.findER':             '查找急诊室',
  'emergency.call988':            '拨打或发短信至988',
  'emergency.crisisText':         '危机文字热线',
  'emergency.crisis':             '988危机热线',
  'emergency.poison':             '中毒控制',
  'emergency.desc.911':           '危及生命的紧急情况',
  'emergency.desc.er':            '最近的急诊室，按距离排序',
  'emergency.desc.988':           '危机热线 — 免费，24/7',
  'emergency.desc.crisisText':    '发送HOME至741741 — 免费，24/7',
  'emergency.desc.poison':        '1-800-222-1222 — 免费，24/7',

  'general.learnMore':            '了解更多',
  'general.close':                '关闭',
  'general.loading':              '加载中…',
  'general.error':                '出了点问题，请重试。',
  'general.save':                 '保存',
  'general.submit':               '提交',
  'general.back':                 '返回',
  'general.next':                 '下一步',
  'general.free':                 '免费',
  'general.slidingScale':         '阶梯收费',
  'general.noInsuranceRequired':  '无需保险',
}

const VI: Translations = {
  /* Nav — anchor section links */
  'nav.features':     'Tính năng',
  'nav.howItWorks':   'Cách hoạt động',
  'nav.eligibility':  'Điều kiện',
  /* Nav — app page links */
  'nav.search':       'Tìm phòng khám',
  'nav.programs':     'Chương trình',
  'nav.rights':       'Quyền của bạn',
  'nav.stories':      'Câu chuyện',
  'nav.advocacy':     'Vận động',
  'nav.chw':          'Nhân viên y tế',
  'nav.pathways':     'Lộ trình',
  'nav.impact':       'Tác động',
  'nav.outcomes':     'Kết quả',
  'nav.calendar':     'Lịch',
  'nav.provider':     'Nhà cung cấp',
  'nav.methodology':  'Phương pháp',
  /* Nav — auth & account actions */
  'nav.signIn':       'Đăng nhập',
  'nav.getStarted':   'Bắt đầu',
  'nav.signOut':      'Đăng xuất',
  'nav.saved':        'Đã lưu',
  'nav.login':        'Đăng nhập',
  'nav.dashboard':    'Bảng điều khiển',
  'nav.logout':       'Đăng xuất',
  /* Mobile dock */
  'dock.search':      'Tìm kiếm',

  'home.hero.badge':          '30 triệu người Mỹ không có bảo hiểm xứng đáng được chăm sóc tốt hơn',
  'home.hero.headline':       'Chăm sóc sức khỏe miễn phí.\nTìm thấy trong vài giây.',
  'home.hero.subheadline':    'NEXUS tìm phòng khám miễn phí, chăm sóc theo thu nhập và các chương trình gần bạn — không cần bảo hiểm.',
  'home.hero.cta':            'Tìm chăm sóc miễn phí gần tôi',
  'home.hero.secondary':      'Tìm hiểu cách hoạt động',
  'home.hero.zipPlaceholder': 'Nhập mã bưu chính hoặc thành phố…',

  'search.placeholder':       'Triệu chứng, chuyên khoa hoặc "nha khoa miễn phí phoenix"…',
  'search.locationPlaceholder': 'Mã bưu chính hoặc thành phố…',
  'search.button':            'Tìm kiếm',
  'search.enterZip':          'Nhập mã bưu chính',
  'search.enterZipDesc':      'Chúng tôi tìm kiếm trong HRSA, NAFC và thư mục cộng đồng để tìm phòng khám miễn phí gần bạn.',
  'search.noResults':         'Không tìm thấy phòng khám gần',
  'search.noResultsHint':     'Thử bán kính lớn hơn hoặc xóa bộ lọc chuyên khoa',
  'search.clinicsNear':       'phòng khám gần',
  'search.clinic':            'phòng khám',
  'search.clinics':           'phòng khám',
  'search.openNow':           'Đang mở cửa',
  'search.closed':            'Đã đóng cửa',
  'search.accepting':         'Đang nhận bệnh nhân',
  'search.findClinic':        'Tìm phòng khám',
  'search.viewDetails':       'Xem chi tiết đầy đủ',
  'search.call':              'Gọi',
  'search.visit':             'Truy cập',
  'search.directions':        'Chỉ đường',
  'search.bookmark':          'Lưu phòng khám',
  'search.bookmarked':        'Đã lưu',
  'search.swipeHint':         'Vuốt phải để lưu · trái để bỏ qua',

  'programs.headline':        'Bạn có thể đủ điều kiện cho nhiều hơn bạn nghĩ',
  'programs.subheadline':     'Kiểm tra điều kiện cho Medicaid, kế hoạch ACA, hỗ trợ bệnh nhân và nhiều hơn nữa.',
  'programs.checkEligibility': 'Kiểm tra điều kiện',
  'programs.annualIncome':    'Thu nhập hộ gia đình hàng năm',
  'programs.householdSize':   'Quy mô hộ gia đình',
  'programs.checkButton':     'Kiểm tra điều kiện của tôi',
  'programs.youMayQualify':   'Bạn có thể đủ điều kiện cho',
  'programs.noMatch':         'Không khớp chính xác — nhưng phòng khám miễn phí luôn sẵn có.',
  'programs.savingsHeadline': 'Tiết kiệm hàng năm tiềm năng',

  'rights.headline':          'Biết quyền của bạn với tư cách là bệnh nhân',
  'rights.subheadline':       'Đây là luật liên bang — bệnh viện và phòng khám phải tuân theo, bất kể tình trạng nhập cư hay bảo hiểm của bạn.',
  'rights.emtala':            'Không thể từ chối chăm sóc khẩn cấp',
  'rights.ada':               'Bạn không thể bị phân biệt đối xử vì khuyết tật',
  'rights.hipaa':             'Thông tin y tế của bạn là riêng tư',
  'rights.titlevi':           'Bạn có quyền có phiên dịch viên',

  'emergency.title':              'Cần giúp đỡ ngay lập tức?',
  'emergency.helpNow':            'Tôi cần giúp đỡ ngay',
  'emergency.helpNowCompact':     'Giúp ngay',
  'emergency.immediateOptions':   'Lựa chọn ngay lập tức',
  'emergency.freeNote':           'Tất cả các nguồn lực đều miễn phí. Không cần bảo hiểm hoặc ID.',
  'emergency.call911':            'Gọi 911',
  'emergency.findER':             'Tìm phòng cấp cứu',
  'emergency.call988':            'Gọi hoặc nhắn tin 988',
  'emergency.crisisText':         'Đường dây tin nhắn khủng hoảng',
  'emergency.crisis':             'Đường dây khủng hoảng 988',
  'emergency.poison':             'Kiểm soát ngộ độc',
  'emergency.desc.911':           'Tình trạng khẩn cấp đe dọa tính mạng',
  'emergency.desc.er':            'Phòng cấp cứu gần nhất, sắp xếp theo khoảng cách',
  'emergency.desc.988':           'Đường dây khủng hoảng — miễn phí, 24/7',
  'emergency.desc.crisisText':    'Nhắn HOME đến 741741 — miễn phí, 24/7',
  'emergency.desc.poison':        '1-800-222-1222 — miễn phí, 24/7',

  'general.learnMore':            'Tìm hiểu thêm',
  'general.close':                'Đóng',
  'general.loading':              'Đang tải…',
  'general.error':                'Đã xảy ra lỗi. Vui lòng thử lại.',
  'general.save':                 'Lưu',
  'general.submit':               'Gửi',
  'general.back':                 'Quay lại',
  'general.next':                 'Tiếp theo',
  'general.free':                 'Miễn phí',
  'general.slidingScale':         'Theo thu nhập',
  'general.noInsuranceRequired':  'Không cần bảo hiểm',
}

/* Remaining languages fall back to English for untranslated keys */
const FALLBACK: Translations = EN

const TRANSLATIONS: Record<LangCode, Translations> = {
  en: EN,
  es: ES,
  zh: ZH,
  vi: VI,
  pt: FALLBACK,
  fr: FALLBACK,
  ar: FALLBACK,
  ko: FALLBACK,
  tl: FALLBACK,
  ru: FALLBACK,
  hi: FALLBACK,
  am: FALLBACK,
}

export function getTranslations(lang: LangCode): Translations {
  return TRANSLATIONS[lang] ?? EN
}

/** Read saved language from localStorage (browser-safe) */
export function getSavedLang(): LangCode {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem('nexus_language') as LangCode) ?? 'en'
}

/** t() helper — looks up a key, falls back to English */
export function t(key: TranslationKey, lang: LangCode = 'en'): string {
  const translations = TRANSLATIONS[lang] ?? EN
  return translations[key] ?? EN[key] ?? key
}
