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
    id: 'wenger',
    name: 'Arsène Wenger',
    years: '1996-2018',
    position: 'Manager',
    nationality: 'France',
    matches: 1235,
    extraChips: ['3× Premier League', '7× FA Cups (record)', 'Invincibles 2003-04'],
    description: {
      'zh-CN': '温格教授，1996-2018年执教阿森纳22年，俱乐部历史上任期最长、执教场次最多的主教练（1235场）。率队3夺英超、7夺足总杯（历史纪录），2003-04赛季49场不败缔造"不败之师"。主导俱乐部从海布里迁入酋长球场，以科学管理与艺术足球彻底改变了阿森纳和英超的足球哲学。',
      'en-US': 'Le Professeur. Managed Arsenal for 22 years (1996-2018), the club\'s longest-serving manager and its record 1,235 matches in charge. Won 3 Premier League titles and a record 7 FA Cups, masterminding the 49-game unbeaten Invincibles of 2003-04. Drove the move from Highbury to Emirates Stadium and transformed Arsenal\'s football philosophy and global standing.'
    },
    plTitles: 3,
    faCups: 7,
    honours: {
      'zh-CN': ['3× 英超冠军（1998 / 2002 / 2004）', '7× 足总杯冠军（历史纪录）', '2003-04 不败之师缔造者', '1998 / 2002 双冠王', '酋长球场奠基人'],
      'en-US': ['3× Premier League (1998 / 2002 / 2004)', 'Record 7× FA Cup winner', 'Architect of the Invincibles 2003-04', '1998 & 2002 Domestic Doubles', 'Founder of the Emirates era']
    },
    highlights: [
      {
        year: '1996',
        title: { 'zh-CN': '「Arsène Who?」', 'en-US': '"Arsène Who?"' },
        text: {
          'zh-CN': '一位来自日本联赛、名不见经传的法国教头接掌阿森纳，英媒一片哗然。他很快用科学管理、饮食革命和艺术足球给出了答案。',
          'en-US': 'A little-known French coach from Japanese football took over at Arsenal to widespread mockery. He soon answered with sports science, a diet revolution and artistic football.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '首个双冠王', 'en-US': 'First Domestic Double' },
        text: {
          'zh-CN': '英超与足总杯双线登顶，阿森纳史上第二次双冠，"阿森纳式足球"自此成型。',
          'en-US': 'League and FA Cup glory in the same season — Arsenal\'s second Double, and a football identity was born.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '再夺双冠', 'en-US': 'Second Double' },
        text: {
          'zh-CN': '老特拉福德击败曼联锁定英超，随后足总杯捧杯，海布里王朝进入全盛。',
          'en-US': 'The title sealed at Old Trafford, the FA Cup added days later — Highbury\'s golden generation at its peak.'
        }
      },
      {
        year: '2004',
        title: { 'zh-CN': '49 场不败', 'en-US': '49 Games Unbeaten' },
        text: {
          'zh-CN': '整个英超赛季不败夺冠，英超创立以来唯一一队，史称"不败之师"。',
          'en-US': 'An entire league season unbeaten — the only side ever to do it in Premier League history. The Invincibles.'
        }
      },
      {
        year: '2006',
        title: { 'zh-CN': '迁入酋长球场', 'en-US': 'Move to Emirates' },
        text: {
          'zh-CN': '主导俱乐部告别93年海布里迁入酋长球场，同年率队首进欧冠决赛，为新时代奠基。',
          'en-US': 'Drove the move from 93 years at Highbury to the Emirates, while leading Arsenal to a first Champions League final.'
        }
      },
      {
        year: '2018',
        title: { 'zh-CN': '22 年谢幕', 'en-US': 'Farewell After 22 Years' },
        text: {
          'zh-CN': '2017年第七座足总杯使其成为赛事夺冠最多主帅，2018年5月结束22年执教，留下3座英超与7座足总杯。',
          'en-US': 'A seventh FA Cup in 2017 made him the competition\'s most successful manager; he departed in May 2018 with 3 league titles and 7 FA Cups.'
        }
      }
    ]
  },
  {
    id: 'henry',
    name: 'Thierry Henry',
    years: '1999-2007, 2012',
    position: 'Forward',
    nationality: 'France',
    apps: 370,
    goals: 228,
    number: 14,
    description: {
      'zh-CN': '阿森纳历史最佳射手，228粒进球。海布里国王，不败赛季核心成员。两次赢得英超金靴，四次英超金靴得主。2003-04赛季不败夺冠的灵魂人物。',
      'en-US': 'Arsenal\'s all-time top scorer with 228 goals. The King of Highbury, key member of the Invincibles. Four-time Premier League Golden Boot winner and the soul of the 2003-04 unbeaten season.'
    },
    plTitles: 2,
    faCups: 3,
    honours: {
      'zh-CN': ['2× 英超冠军（2002 / 2004）', '3× 足总杯冠军', '228 球 · 队史射手王', '4× 英超金靴', '2003-04 不败之师核心', '2006 欧冠亚军'],
      'en-US': ['2× Premier League (2002 / 2004)', '3× FA Cup winner', '228 goals · All-time top scorer', '4× Premier League Golden Boot', 'Heart of the Invincibles', '2006 UCL runner-up']
    },
    highlights: [
      {
        year: '1999',
        title: { 'zh-CN': '从尤文加盟', 'en-US': 'Signing from Juventus' },
        text: {
          'zh-CN': '在都灵失意的边锋被温格看中，改造成中锋后火力全开，海布里之王的时代拉开帷幕。',
          'en-US': 'A frustrated winger in Turin, converted by Wenger into a centre-forward — the King of Highbury era began.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '双冠王', 'en-US': 'The Double' },
        text: {
          'zh-CN': '足总杯决赛制胜球帮助阿森纳双冠登顶，联赛32场不败捧杯。',
          'en-US': 'Scored the winner in the FA Cup final as Arsenal completed the Double with a 32-game unbeaten league run.'
        }
      },
      {
        year: '2004',
        title: { 'zh-CN': '不败之师', 'en-US': 'The Invincibles' },
        text: {
          'zh-CN': '全季不败的赛季贡献30球荣膺金靴，与博格坎普的双人舞成为英超最美的风景。',
          'en-US': '30 goals and the Golden Boot in the unbeaten season — his partnership with Bergkamp defined an era.'
        }
      },
      {
        year: '2005',
        title: { 'zh-CN': '加冕队史射手王', 'en-US': 'All-Time Top Scorer' },
        text: {
          'zh-CN': '接连追平并打破伊恩·赖特保持的185球队史纪录，最终将数字定格在228球。',
          'en-US': 'Moved past Ian Wright\'s 185-goal club record, a mark he would stretch to 228.'
        }
      },
      {
        year: '2006',
        title: { 'zh-CN': '首进欧冠决赛', 'en-US': 'First UCL Final' },
        text: {
          'zh-CN': '淘汰皇马、尤文一路护送阿森纳首登欧洲之巅的舞台，酋长球场元年告别。',
          'en-US': 'Knocked out Real Madrid and Juventus on the run to a first Champions League final, then bade farewell in the Emirates\' first year.'
        }
      },
      {
        year: '2012',
        title: { 'zh-CN': '传奇归来', 'en-US': 'The Return' },
        text: {
          'zh-CN': '租借回归63天打进3球，足总杯制胜、北伦敦德比绝平，为传奇画上温柔句点。',
          'en-US': 'Three goals in a 63-day loan spell — an FA Cup winner and a North London derby equaliser to close the story.'
        }
      }
    ]
  },
  {
    id: 'bergkamp',
    name: 'Dennis Bergkamp',
    years: '1995-2006',
    position: 'Forward',
    nationality: 'Netherlands',
    apps: 423,
    goals: 120,
    number: 10,
    description: {
      'zh-CN': '冰人，阿森纳技术流代表。非毁容式的触球和传球，无数经典进球。不败赛季不可或缺的创意核心。',
      'en-US': 'The Iceman, Arsenal\'s technical maestro. Renowned for his sublime touch and vision, scoring countless memorable goals. An indispensable creative force in the Invincibles season.'
    },
    plTitles: 3,
    faCups: 4,
    honours: {
      'zh-CN': ['3× 英超冠军（1998 / 2002 / 2004）', '4× 足总杯冠军', '2003-04 不败之师创意核心', '冰王子 · 艺术足球代名词'],
      'en-US': ['3× Premier League (1998 / 2002 / 2004)', '4× FA Cup winner', 'Creative heart of the Invincibles', 'The Iceman — football as art']
    },
    highlights: [
      {
        year: '1995',
        title: { 'zh-CN': '从国米加盟', 'en-US': 'Signing from Inter' },
        text: {
          'zh-CN': '在意大利失意的荷兰大师转战英伦，阿森纳从此拥有英超历史上最优雅的进攻大脑。',
          'en-US': 'A Dutch master adrift in Italy found his home in London — Arsenal had the most elegant attacking brain of the Premier League era.'
        }
      },
      {
        year: '1997',
        title: { 'zh-CN': '莱斯特帽子戏法', 'en-US': 'Leicester Hat-Trick' },
        text: {
          'zh-CN': '单场三粒进球粒粒世界波，被英超官方称为"艺术"，其中一球获当年年度最佳。',
          'en-US': 'Three stunners in one afternoon at Leicester — a hat-trick celebrated as pure art, one voted Goal of the Season.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '双冠王', 'en-US': 'The Double' },
        text: {
          'zh-CN': '英超+足总杯双冠核心，荷兰人的传球视野让海布里看见未来。',
          'en-US': 'Central to the 1998 Double — his vision showed Highbury the future of the game.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '纽卡斯尔世纪进球', 'en-US': 'The Newcastle Masterpiece' },
        text: {
          'zh-CN': '背身人球分过、转身、推射一气呵成，这粒进球被永久镌刻在英超历史最佳进球之列。',
          'en-US': 'A flick around the defender, a spin and a finish in one motion — permanently engraved among the greatest Premier League goals.'
        }
      },
      {
        year: '2006',
        title: { 'zh-CN': '海布里告别', 'en-US': 'Highbury Farewell' },
        text: {
          'zh-CN': '十年冰王子在海布里最后一战挂靴，全场球迷起立以掌声与横幅致敬。',
          'en-US': 'The Iceman\'s final game at Highbury — "Dennis is a legend" banners saluted a decade of magic.'
        }
      }
    ]
  },
  {
    id: 'vieira',
    name: 'Patrick Vieira',
    years: '1996-2005',
    position: 'Midfielder',
    nationality: 'France',
    apps: 406,
    goals: 34,
    number: 4,
    description: {
      'zh-CN': '不败赛季队长，中场铁闸。力量与技术的完美结合，阿森纳中场的精神领袖。在2003-04不败赛季佩戴队长袖标。',
      'en-US': 'Captain of the Invincibles, midfield enforcer. The perfect blend of power and technique, Arsenal\'s spiritual leader in midfield. Wore the armband during the 2003-04 unbeaten season.'
    },
    plTitles: 3,
    faCups: 4,
    honours: {
      'zh-CN': ['3× 英超冠军（1998 / 2002 / 2004）', '4× 足总杯冠军', '2003-04 不败之师队长', '温格时代首笔重要签约'],
      'en-US': ['3× Premier League (1998 / 2002 / 2004)', '4× FA Cup winner', 'Captain of the Invincibles', 'Wenger\'s first marquee signing']
    },
    highlights: [
      {
        year: '1996',
        title: { 'zh-CN': '从 AC 米兰加盟', 'en-US': 'Signing from AC Milan' },
        text: {
          'zh-CN': '20岁的法国长人登陆海布里，很快成为中场不可或缺的驱动力。',
          'en-US': 'A 20-year-old Frenchman arrived at Highbury and quickly became the driving force of the midfield.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '双冠王', 'en-US': 'The Double' },
        text: {
          'zh-CN': '与佩蒂特组成世界最强双后腰，英超足总杯双双登顶。',
          'en-US': 'Alongside Petit, formed the world\'s finest midfield axis as Arsenal swept to the Double.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '接任队长', 'en-US': 'The Armband' },
        text: {
          'zh-CN': '亚当斯挂靴后接过袖标，成为更衣室新的精神领袖。',
          'en-US': 'Succeeded Adams as captain and became the new spiritual leader of the dressing room.'
        }
      },
      {
        year: '2004',
        title: { 'zh-CN': '不败之师统帅', 'en-US': 'Leader of the Invincibles' },
        text: {
          'zh-CN': '以队长身份率队完成整个赛季不败，意志与优雅并存的英超最伟大中场之一。',
          'en-US': 'Captained Arsenal through an unbeaten league season — one of the greatest midfielders the Premier League has seen.'
        }
      },
      {
        year: '2005',
        title: { 'zh-CN': '最后一张点球', 'en-US': 'The Final Penalty' },
        text: {
          'zh-CN': '足总杯决赛点球大战亲自主罚制胜点球击败曼联，随后含泪告别转会尤文图斯。',
          'en-US': 'Struck the winning penalty against Manchester United in the FA Cup final shootout, then left for Juventus in tears.'
        }
      }
    ]
  },
  {
    id: 'adams',
    name: 'Tony Adams',
    years: '1983-2002',
    position: 'Defender',
    nationality: 'England',
    apps: 669,
    goals: 48,
    number: 5,
    description: {
      'zh-CN': '阿森纳先生，19年忠诚服务。四个不同年代的英超冠军的队长。英格兰足球史上最伟大的中后卫之一。',
      'en-US': 'Mr. Arsenal, 19 years of loyal service. Captain in four different decades of league titles. One of the greatest central defenders in English football history.'
    },
    plTitles: 2,
    faCups: 3,
    honours: {
      'zh-CN': ['1989 / 1991 / 1998 / 2002 四个年代联赛冠军', '3× 足总杯冠军（1993 / 1998 / 2002）', '1994 欧洲优胜者杯', 'Mr. Arsenal · 一生一队'],
      'en-US': ['League titles across four eras (1989 / 1991 / 1998 / 2002)', '3× FA Cup winner (1993 / 1998 / 2002)', '1994 European Cup Winners\' Cup', 'Mr. Arsenal — one club, one life']
    },
    highlights: [
      {
        year: '1983',
        title: { 'zh-CN': '17 岁首秀', 'en-US': 'Debut at 17' },
        text: {
          'zh-CN': '圣诞节前后完成一线队首秀，此后669场从未离开，成为阿森纳的代名词。',
          'en-US': 'Broke into the first team as a teenager and never left — 669 appearances made him the embodiment of Arsenal.'
        }
      },
      {
        year: '1989',
        title: { 'zh-CN': '安菲尔德之夜', 'en-US': 'Anfield, 1989' },
        text: {
          'zh-CN': '客场2-0绝杀利物浦、最后时刻重夺联赛冠军的奇迹之夜，他是捧起奖杯的队长。',
          'en-US': 'Captain on the miracle night at Anfield — 2-0, the title snatched in the final seconds after 18 years.'
        }
      },
      {
        year: '1996',
        title: { 'zh-CN': '重生', 'en-US': 'Reinvention' },
        text: {
          'zh-CN': '公开承认酒精问题并彻底改变自己，此后以更职业的形象成为全英超的榜样。',
          'en-US': 'Confronted his alcohol problems publicly and rebuilt himself into a model professional for the entire league.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '双冠王', 'en-US': 'The Double' },
        text: {
          'zh-CN': '从1989到1998，横跨两个年代再次率队双冠登顶。',
          'en-US': 'Led Arsenal to the Double again — a decade on from his first title.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '完美谢幕', 'en-US': 'The Perfect Farewell' },
        text: {
          'zh-CN': '以队长身份最后一季再夺双冠，在巅峰时刻宣布挂靴，669场成传奇注脚。',
          'en-US': 'Captained the side to one more Double in his final season, then retired at the very top.'
        }
      }
    ]
  },
  {
    id: 'wright',
    name: 'Ian Wright',
    years: '1991-1998',
    position: 'Forward',
    nationality: 'England',
    apps: 288,
    goals: 185,
    number: 8,
    description: {
      'zh-CN': '阿森纳历史第二射手，185粒进球。激情四射的射手，1997年打破俱乐部历史进球纪录。',
      'en-US': 'Arsenal\'s second all-time top scorer with 185 goals. A passionate striker who broke the club\'s all-time scoring record in 1997.'
    },
    plTitles: 1,
    faCups: 2,
    honours: {
      'zh-CN': ['1× 英超冠军（1998）', '2× 足总杯冠军（1993 / 1998）', '1× 联赛杯冠军（1993）', '185 球 · 队史射手王（保持至 2005）', '从非联赛球员到枪手传奇'],
      'en-US': ['1× Premier League (1998)', '2× FA Cup (1993 / 1998)', '1× League Cup (1993)', '185 goals · All-time top scorer until 2005', 'From non-League to Gunners great']
    },
    highlights: [
      {
        year: '1991',
        title: { 'zh-CN': '从水晶宫加盟', 'en-US': 'Signing from Crystal Palace' },
        text: {
          'zh-CN': '以创俱乐部纪录的250万英镑从水晶宫加盟，25岁才迎来顶级联赛首秀的射手自此开启传奇。',
          'en-US': 'Signed from Crystal Palace for a club-record £2.5m — a striker who only made his top-flight debut at 25 was about to make history.'
        }
      },
      {
        year: '1993',
        title: { 'zh-CN': '双杯加冕', 'en-US': 'Cup Double' },
        text: {
          'zh-CN': '足总杯两回合决赛均有进球，助球队同年捧起足总杯与联赛杯。',
          'en-US': 'Scored in both FA Cup finals as Arsenal landed the FA Cup and League Cup in the same season.'
        }
      },
      {
        year: '1997',
        title: { 'zh-CN': '打破 63 年纪录', 'en-US': 'Breaking the 63-Year Record' },
        text: {
          'zh-CN': '对博尔顿一役打进个人第179球，超越巴斯汀保持63年的队史纪录，甩衣庆祝成为经典画面。',
          'en-US': 'Struck his 179th Arsenal goal against Bolton to break Cliff Bastin\'s 63-year-old record — the shirt-swing celebration became iconic.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '英超冠军', 'en-US': 'Premier League Champion' },
        text: {
          'zh-CN': '屡有关键进球，随队成就英超+足总杯双冠，补齐职业生涯荣誉拼图。',
          'en-US': 'Key goals throughout the campaign as Arsenal completed the Premier League and FA Cup Double.'
        }
      },
      {
        year: '1998',
        title: { 'zh-CN': '告别海布里', 'en-US': 'Highbury Farewell' },
        text: {
          'zh-CN': '夏天告别海布里，留下288场185球；直到2005年，这一纪录才被亨利改写。',
          'en-US': 'Left Highbury that summer with 185 goals in 288 games — a record that stood until Thierry Henry passed it in 2005.'
        }
      }
    ]
  },
  {
    id: 'pires',
    name: 'Robert Pires',
    years: '2000-2006',
    position: 'Midfielder',
    nationality: 'France',
    apps: 281,
    goals: 84,
    number: 7,
    description: {
      'zh-CN': '不败赛季左路之王，优雅的法国边锋。2003-04赛季打进14球，PFA年度最佳球员提名。',
      'en-US': 'The left-wing king of the Invincibles, elegant French winger. Scored 14 goals in the 2003-04 season, PFA Player of the Year nominee.'
    },
    plTitles: 2,
    faCups: 3,
    honours: {
      'zh-CN': ['2× 英超冠军（2002 / 2004）', '3× 足总杯冠军', '2001-02 PFA 年度最佳球员', '2003-04 不败之师左路之王'],
      'en-US': ['2× Premier League (2002 / 2004)', '3× FA Cup winner', 'PFA Player of the Year 2001-02', 'King of the Invincibles\' left flank']
    },
    highlights: [
      {
        year: '2000',
        title: { 'zh-CN': '从马赛加盟', 'en-US': 'Signing from Marseille' },
        text: {
          'zh-CN': '欧洲杯冠军成员从马赛登陆海布里，左路魔术师就此登场。',
          'en-US': 'A Euro 2000 winner arrived from Marseille — the left-side magician had landed.'
        }
      },
      {
        year: '2002',
        title: { 'zh-CN': '双冠 + PFA 最佳', 'en-US': 'The Double + PFA Award' },
        text: {
          'zh-CN': '左路风驰电掣，帮助球队重夺英超并加冕足总杯，个人荣膺 PFA 年度最佳球员。',
          'en-US': 'Electric on the left wing, he helped Arsenal reclaim the title and lift the FA Cup while being named PFA Player of the Year.'
        }
      },
      {
        year: '2004',
        title: { 'zh-CN': '不败之师', 'en-US': 'The Invincibles' },
        text: {
          'zh-CN': '不败赛季贡献14粒英超进球，与亨利、博格坎普组成让全联盟胆寒的攻击群。',
          'en-US': '14 league goals in the unbeaten season, forming a fearsome front line alongside Henry and Bergkamp.'
        }
      },
      {
        year: '2005',
        title: { 'zh-CN': '制胜点球', 'en-US': 'The Winning Penalty' },
        text: {
          'zh-CN': '足总杯决赛与曼联鏖战至点球大战，他冷静射入制胜点球，捧起足总杯。',
          'en-US': 'Held his nerve in the shootout to convert the winning penalty against Manchester United in the FA Cup final.'
        }
      },
      {
        year: '2006',
        title: { 'zh-CN': '决赛伤退，挥别枪手', 'en-US': 'Final Heartbreak and Farewell' },
        text: {
          'zh-CN': '欧冠决赛开场伤退留下遗憾，夏天转战比利亚雷亚尔，为六年枪手生涯画上句点。',
          'en-US': 'An early injury in the Champions League final foreshadowed the end — he left for Villarreal after six years in red and white.'
        }
      }
    ]
  },
  {
    id: 'fabregas',
    name: 'Cesc Fabregas',
    years: '2003-2011',
    position: 'Midfielder',
    nationality: 'Spain',
    apps: 303,
    goals: 57,
    number: 4,
    description: {
      'zh-CN': '阿森纳最年轻的队长，16岁加盟。传球大师，从维埃拉手中接过接力棒，成为阿森纳中场核心。',
      'en-US': 'Arsenal\'s youngest-ever captain, joined at 16. A passing maestro who took the baton from Vieira to become Arsenal\'s midfield fulcrum.'
    },
    plTitles: 0,
    faCups: 1,
    honours: {
      'zh-CN': ['1× 足总杯冠军（2005）', '阿森纳史上最年轻队长（21岁）', '16岁177天完成一线队首秀', '2007-08 PFA 最佳年轻球员'],
      'en-US': ['1× FA Cup (2005)', 'Arsenal\'s youngest-ever captain (21)', 'First-team debut at 16 years 177 days', 'PFA Young Player of the Year 2007-08']
    },
    highlights: [
      {
        year: '2003',
        title: { 'zh-CN': '16 岁登台', 'en-US': 'Debut at 16' },
        text: {
          'zh-CN': '联赛杯16岁177天完成一线队首秀，队史最年轻纪录自此写下一个西班牙少年的名字。',
          'en-US': 'Made his first-team debut in the League Cup at 16 years 177 days — the youngest in club history.'
        }
      },
      {
        year: '2005',
        title: { 'zh-CN': '足总杯初冠', 'en-US': 'First FA Cup' },
        text: {
          'zh-CN': '年仅18岁便随队捧起足总杯，在维埃拉离队后逐渐站稳中场。',
          'en-US': 'An FA Cup winner at just 18, ready to step up after Patrick Vieira\'s departure.'
        }
      },
      {
        year: '2008',
        title: { 'zh-CN': '接任队长', 'en-US': 'The Captaincy' },
        text: {
          'zh-CN': '温格将队长袖标交给21岁的他，西班牙人自此成为阿森纳中场大脑。',
          'en-US': 'Handed the captaincy by Wenger at 21, the Spaniard became Arsenal\'s midfield brain.'
        }
      },
      {
        year: '2011',
        title: { 'zh-CN': '重返巴萨', 'en-US': 'Return to Barcelona' },
        text: {
          'zh-CN': '七年枪手生涯留下303场57球，夏天重返母队巴塞罗那，酋长球场以掌声相送。',
          'en-US': '303 games and 57 goals into a seven-year spell, he returned to Barcelona that summer to applause from the Emirates.'
        }
      }
    ]
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
