// Static data for club, legends, stadium, women

export const clubInfo = {
  founded: 1886,
  ground: 'Emirates Stadium',
  groundCapacity: 60704,
  city: 'London',
  chairman: 'Josh Kroenke',
  manager: 'Mikel Arteta',
  ceo: 'Vinai Venkatesham',
  sportDirector: 'Edu Gaspar',
  nickname: 'The Gunners',
  officialSite: 'https://www.arsenal.com',
  description: {
    'zh-CN': '阿森纳足球俱乐部成立于1886年，是英格兰历史最悠久的足球俱乐部之一。主场为酋长球场，位于伦敦霍洛威。阿森纳是英超联赛传统豪门，曾14次夺得英格兰顶级联赛冠军，14次赢得足总杯（纪录保持者），男子一线队共获得49项重大奖杯。',
    'en-US': 'Arsenal Football Club, founded in 1886, is one of England\'s most historic football clubs. Based at the Emirates Stadium in Holloway, London, Arsenal is a traditional Premier League powerhouse, having won the English top-flight title 14 times and the FA Cup a record 14 times. The men\'s first team has won 49 major trophies.'
  }
}

export const honours = [
  { title: { 'zh-CN': '英格兰顶级联赛冠军', 'en-US': 'First Division / Premier League' }, count: 14, years: [1931, 1933, 1934, 1935, 1938, 1948, 1953, 1971, 1989, 1991, 1998, 2002, 2004, 2025] },
  { title: { 'zh-CN': '足总杯冠军', 'en-US': 'FA Cup' }, count: 14, years: [1930, 1936, 1950, 1971, 1979, 1993, 1998, 2002, 2003, 2005, 2014, 2015, 2017, 2020] },
  { title: { 'zh-CN': '联赛杯冠军', 'en-US': 'EFL Cup' }, count: 2, years: [1987, 1993] },
  { title: { 'zh-CN': '社区盾冠军', 'en-US': 'FA Community Shield' }, count: 17, years: [1930, 1931, 1933, 1934, 1938, 1948, 1953, 1991, 1998, 1999, 2002, 2004, 2014, 2015, 2017, 2020, 2023] },
  { title: { 'zh-CN': '欧洲优胜者杯', 'en-US': 'UEFA Cup Winners\' Cup' }, count: 1, years: [1994] },
  { title: { 'zh-CN': '国际城市博览会杯', 'en-US': 'Inter-Cities Fairs Cup' }, count: 1, years: [1970] }
]

export const legends = [
  {
    id: 'henry',
    name: 'Thierry Henry',
    years: '1999-2007, 2012',
    position: 'Forward',
    nationality: 'France',
    apps: 370,
    goals: 228,
    description: {
      'zh-CN': '阿森纳历史最佳射手，228粒进球。海布里国王，不败赛季核心成员。两次赢得英超金靴，四次英超金靴得主。2003-04赛季不败夺冠的灵魂人物。',
      'en-US': 'Arsenal\'s all-time top scorer with 228 goals. The King of Highbury, key member of the Invincibles. Four-time Premier League Golden Boot winner and the soul of the 2003-04 unbeaten season.'
    }
  },
  {
    id: 'bergkamp',
    name: 'Dennis Bergkamp',
    years: '1995-2006',
    position: 'Forward',
    nationality: 'Netherlands',
    apps: 423,
    goals: 120,
    description: {
      'zh-CN': '冰人，阿森纳技术流代表。非毁容式的触球和传球，无数经典进球。不败赛季不可或缺的创意核心。',
      'en-US': 'The Iceman, Arsenal\'s technical maestro. Renowned for his sublime touch and vision, scoring countless memorable goals. An indispensable creative force in the Invincibles season.'
    }
  },
  {
    id: 'vieira',
    name: 'Patrick Vieira',
    years: '1996-2005',
    position: 'Midfielder',
    nationality: 'France',
    apps: 406,
    goals: 34,
    description: {
      'zh-CN': '不败赛季队长，中场铁闸。力量与技术的完美结合，阿森纳中场的精神领袖。在2003-04不败赛季佩戴队长袖标。',
      'en-US': 'Captain of the Invincibles, midfield enforcer. The perfect blend of power and technique, Arsenal\'s spiritual leader in midfield. Wore the armband during the 2003-04 unbeaten season.'
    }
  },
  {
    id: 'adams',
    name: 'Tony Adams',
    years: '1983-2002',
    position: 'Defender',
    nationality: 'England',
    apps: 669,
    goals: 48,
    description: {
      'zh-CN': '阿森纳先生，19年忠诚服务。四个不同年代的英超冠军的队长。英格兰足球史上最伟大的中后卫之一。',
      'en-US': 'Mr. Arsenal, 19 years of loyal service. Captain in four different decades of league titles. One of the greatest central defenders in English football history.'
    }
  },
  {
    id: 'wright',
    name: 'Ian Wright',
    years: '1991-1998',
    position: 'Forward',
    nationality: 'England',
    apps: 288,
    goals: 185,
    description: {
      'zh-CN': '阿森纳历史第二射手，185粒进球。激情四射的射手，1997年打破俱乐部历史进球纪录。',
      'en-US': 'Arsenal\'s second all-time top scorer with 185 goals. A passionate striker who broke the club\'s all-time scoring record in 1997.'
    }
  },
  {
    id: 'pires',
    name: 'Robert Pires',
    years: '2000-2006',
    position: 'Midfielder',
    nationality: 'France',
    apps: 281,
    goals: 84,
    description: {
      'zh-CN': '不败赛季左路之王，优雅的法国边锋。2003-04赛季打进14球，PFA年度最佳球员提名。',
      'en-US': 'The left-wing king of the Invincibles, elegant French winger. Scored 14 goals in the 2003-04 season, PFA Player of the Year nominee.'
    }
  },
  {
    id: 'fabregas',
    name: 'Cesc Fabregas',
    years: '2003-2011',
    position: 'Midfielder',
    nationality: 'Spain',
    apps: 303,
    goals: 57,
    description: {
      'zh-CN': '阿森纳最年轻的队长，16岁加盟。传球大师，从维埃拉手中接过接力棒，成为阿森纳中场核心。',
      'en-US': 'Arsenal\'s youngest-ever captain, joined at 16. A passing maestro who took the baton from Vieira to become Arsenal\'s midfield fulcrum.'
    }
  }
]

export const stadiumInfo = {
  name: 'Emirates Stadium',
  nameZh: '酋长球场',
  capacity: 60704,
  opened: 2006,
  architect: 'Populous (HOK Sport)',
  cost: '£390 million',
  address: 'Highbury House, 75 Drayton Park, London N5 1BU',
  description: {
    'zh-CN': '酋长球场于2006年启用，可容纳60,704名观众，是英国第三大足球场。取代了传奇的海布里球场，成为阿森纳的新家。',
    'en-US': 'The Emirates Stadium, opened in 2006, accommodates 60,704 spectators and is the third-largest football stadium in England. It replaced the legendary Highbury as Arsenal\'s home.'
  },
  transport: [
    { 'zh-CN': '地铁 Piccadilly Line，Holloway Road 站步行5分钟', 'en-US': 'Piccadilly Line to Holloway Road, 5-min walk' },
    { 'zh-CN': '地铁 Piccadilly/Arsenal 站步行3分钟', 'en-US': 'Piccadilly/Arsenal station, 3-min walk' },
    { 'zh-CN': '巴士 4, 17, 29, 43, 271, 319 路线', 'en-US': 'Bus routes 4, 17, 29, 43, 271, 319' }
  ],
  stands: [
    { name: 'West Stand', nameZh: '西看台', capacity: 11000 },
    { name: 'East Stand', nameZh: '东看台', capacity: 11000 },
    { name: 'North Bank', nameZh: '北岸', capacity: 15000 },
    { name: 'Clock End', nameZh: '钟楼看台', capacity: 15000 }
  ]
}

export const womenInfo = {
  name: 'Arsenal Women FC',
  nameZh: '阿森纳女足',
  founded: 1987,
  ground: 'Meadow Park (Borehamwood)',
  manager: 'Jonas Eidevall',
  description: {
    'zh-CN': '阿森纳女足是英格兰最成功的女子足球俱乐部，15次赢得女子英超冠军，14次赢得女子足总杯。1992年成立的女子英超元年冠军。',
    'en-US': 'Arsenal Women are England\'s most successful women\'s football club, with 15 Women\'s Super League titles and 14 Women\'s FA Cups. Inaugural WSL champions in 1992.'
  },
  honours: [
    { title: { 'zh-CN': '女子英超', 'en-US': 'WSL' }, count: 15 },
    { title: { 'zh-CN': '女子足总杯', 'en-US': 'Women\'s FA Cup' }, count: 14 },
    { title: { 'zh-CN': '女子联赛杯', 'en-US': 'WSL Cup' }, count: 5 },
    { title: { 'zh-CN': '欧洲女子欧冠', 'en-US': 'UEFA Women\'s Cup' }, count: 1 }
  ],
  officialSite: 'https://www.arsenal.com/arsenal-women'
}
