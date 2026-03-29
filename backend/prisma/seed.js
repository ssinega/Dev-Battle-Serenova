const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.safetyPlan.deleteMany();
  await prisma.moodCheckin.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.crisisContact.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const adminHash = await bcrypt.hash('Admin@1234', 12);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@serenova.com',
      password_hash: adminHash,
      username: 'Admin',
      role: 'ADMIN',
      is_verified: true,
    },
  });

  // Demo patient
  const patient = await prisma.user.create({
    data: {
      email: 'patient@demo.com',
      password_hash: passwordHash,
      username: 'Alex Johnson',
      role: 'PATIENT',
      is_verified: true,
    },
  });

  // Demo therapist user
  const therapistUser1 = await prisma.user.create({
    data: {
      email: 'therapist@demo.com',
      password_hash: passwordHash,
      username: 'Dr. Sarah Mitchell',
      role: 'THERAPIST',
      is_verified: true,
    },
  });

  // Additional therapist users
  const therapistUser2 = await prisma.user.create({
    data: {
      email: 'therapist2@demo.com',
      password_hash: passwordHash,
      username: 'Dr. James Okoye',
      role: 'THERAPIST',
      is_verified: true,
    },
  });

  const therapistUser3 = await prisma.user.create({
    data: {
      email: 'therapist3@demo.com',
      password_hash: passwordHash,
      username: 'Dr. Priya Sharma',
      role: 'THERAPIST',
      is_verified: true,
    },
  });

  const therapistUser4 = await prisma.user.create({
    data: {
      email: 'therapist4@demo.com',
      password_hash: passwordHash,
      username: 'Dr. Lena Fischer',
      role: 'THERAPIST',
      is_verified: true,
    },
  });

  const therapistUser5 = await prisma.user.create({
    data: {
      email: 'therapist5@demo.com',
      password_hash: passwordHash,
      username: 'Dr. Marcus Wei',
      role: 'THERAPIST',
      is_verified: true,
    },
  });

  // Therapist profiles
  const therapist1 = await prisma.therapist.create({
    data: {
      user_id: therapistUser1.id,
      full_name: 'Dr. Sarah Mitchell',
      bio: 'I am a licensed clinical psychologist with over 12 years of experience specializing in anxiety, depression, and trauma recovery. My approach integrates cognitive-behavioral therapy with mindfulness-based techniques to create a personalized healing journey for each client.',
      specializations: JSON.stringify(['Anxiety', 'Depression', 'Trauma & PTSD', 'CBT']),
      languages: JSON.stringify(['English', 'Spanish']),
      session_types: JSON.stringify(['VIDEO', 'VOICE', 'CHAT']),
      hourly_rate: 120,
      rating: 4.9,
      total_reviews: 147,
      is_verified: true,
      availability_json: JSON.stringify({
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '13:00', '14:00'],
        wednesday: ['11:00', '12:00', '15:00', '16:00'],
        thursday: ['09:00', '10:00', '14:00', '15:00'],
        friday: ['09:00', '10:00', '11:00'],
      }),
    },
  });

  const therapist2 = await prisma.therapist.create({
    data: {
      user_id: therapistUser2.id,
      full_name: 'Dr. James Okoye',
      bio: 'As a compassionate therapist specializing in relationships and stress management, I help individuals and couples build healthier communication patterns. My culturally sensitive approach ensures everyone feels seen and heard in their healing process.',
      specializations: JSON.stringify(['Relationships', 'Stress Management', 'Couples Therapy', 'Communication']),
      languages: JSON.stringify(['English', 'Yoruba', 'French']),
      session_types: JSON.stringify(['VIDEO', 'CHAT']),
      hourly_rate: 95,
      rating: 4.7,
      total_reviews: 89,
      is_verified: true,
      availability_json: JSON.stringify({
        monday: ['10:00', '11:00', '15:00', '16:00'],
        wednesday: ['09:00', '10:00', '14:00'],
        friday: ['10:00', '11:00', '13:00', '14:00'],
        saturday: ['09:00', '10:00', '11:00'],
      }),
    },
  });

  const therapist3 = await prisma.therapist.create({
    data: {
      user_id: therapistUser3.id,
      full_name: 'Dr. Priya Sharma',
      bio: 'I specialize in sleep disorders, mindfulness, and holistic mental wellness. Drawing from both Western psychology and Eastern contemplative practices, I offer a unique integrative approach that helps clients find balance and peace in their daily lives.',
      specializations: JSON.stringify(['Sleep Disorders', 'Mindfulness', 'Stress', 'Holistic Wellness']),
      languages: JSON.stringify(['English', 'Hindi', 'Gujarati']),
      session_types: JSON.stringify(['VIDEO', 'VOICE', 'CHAT']),
      hourly_rate: 110,
      rating: 4.8,
      total_reviews: 203,
      is_verified: true,
      availability_json: JSON.stringify({
        tuesday: ['09:00', '10:00', '11:00', '14:00'],
        thursday: ['09:00', '10:00', '15:00', '16:00'],
        saturday: ['10:00', '11:00', '12:00'],
      }),
    },
  });

  const therapist4 = await prisma.therapist.create({
    data: {
      user_id: therapistUser4.id,
      full_name: 'Dr. Lena Fischer',
      bio: 'Trauma specialist with expertise in EMDR therapy and somatic approaches. I have worked with survivors of complex trauma for over 15 years, helping them reclaim their sense of safety and rebuild meaningful lives with compassion and evidence-based techniques.',
      specializations: JSON.stringify(['Trauma & PTSD', 'EMDR', 'Somatic Therapy', 'Complex Trauma']),
      languages: JSON.stringify(['English', 'German']),
      session_types: JSON.stringify(['VIDEO', 'VOICE']),
      hourly_rate: 150,
      rating: 5.0,
      total_reviews: 67,
      is_verified: true,
      availability_json: JSON.stringify({
        monday: ['13:00', '14:00', '15:00'],
        wednesday: ['13:00', '14:00', '15:00', '16:00'],
        friday: ['13:00', '14:00'],
      }),
    },
  });

  const therapist5 = await prisma.therapist.create({
    data: {
      user_id: therapistUser5.id,
      full_name: 'Dr. Marcus Wei',
      bio: 'I specialize in adolescent mental health, identity exploration, and depression. Using an affirming, non-judgmental approach, I create a safe space for teenagers and young adults to explore their emotions and develop resilience for life\'s challenges.',
      specializations: JSON.stringify(['Adolescent Mental Health', 'Depression', 'Identity', 'Life Transitions']),
      languages: JSON.stringify(['English', 'Mandarin']),
      session_types: JSON.stringify(['VIDEO', 'CHAT']),
      hourly_rate: 100,
      rating: 4.6,
      total_reviews: 112,
      is_verified: true,
      availability_json: JSON.stringify({
        monday: ['16:00', '17:00', '18:00'],
        tuesday: ['16:00', '17:00', '18:00'],
        thursday: ['16:00', '17:00', '18:00'],
        friday: ['16:00', '17:00'],
      }),
    },
  });

  // Upcoming session for demo patient
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  futureDate.setHours(14, 0, 0, 0);

  await prisma.session.create({
    data: {
      patient_id: patient.id,
      therapist_id: therapist1.id,
      scheduled_at: futureDate,
      duration_minutes: 60,
      type: 'VIDEO',
      status: 'CONFIRMED',
    },
  });

  // Past completed session
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);

  await prisma.session.create({
    data: {
      patient_id: patient.id,
      therapist_id: therapist1.id,
      scheduled_at: pastDate,
      duration_minutes: 60,
      type: 'CHAT',
      status: 'COMPLETED',
      rating: 5,
      review: 'Dr. Mitchell was incredibly helpful and understanding. I feel so much better after our session.',
    },
  });

  // Resources
  await prisma.resource.createMany({
    data: [
      {
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about the science behind anxiety, its causes, symptoms, and evidence-based strategies to manage it effectively in daily life.',
        category: 'ANXIETY',
        type: 'ARTICLE',
        url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
        thumbnail_url: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=400',
      },
      {
        title: '10-Minute Guided Meditation for Stress Relief',
        description: 'A calming audio meditation designed to reduce cortisol levels and bring your nervous system into a state of relaxation within minutes.',
        category: 'STRESS',
        type: 'AUDIO',
        url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
        thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      },
      {
        title: 'Cognitive Behavioral Therapy Worksheets',
        description: 'A collection of evidence-based CBT worksheets to help identify negative thought patterns and replace them with healthier perspectives.',
        category: 'DEPRESSION',
        type: 'WORKSHEET',
        url: 'https://www.therapistaid.com/therapy-worksheets/cbt',
        thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
      },
      {
        title: 'Sleep Hygiene: Building Better Bedtime Habits',
        description: 'Discover science-backed strategies to improve your sleep quality, from optimizing your sleep environment to managing screen time effectively.',
        category: 'SLEEP',
        type: 'ARTICLE',
        url: 'https://www.sleepfoundation.org/sleep-hygiene',
        thumbnail_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400',
      },
      {
        title: 'Trauma-Informed Self-Care Practices',
        description: 'A gentle video guide introducing trauma-sensitive approaches to self-care, designed for survivors navigating their healing journey with compassion.',
        category: 'TRAUMA',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=9D05ej8u-gU',
        thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      },
      {
        title: 'Building Healthy Communication in Relationships',
        description: 'Learn effective communication techniques, active listening skills, and boundary-setting strategies to foster deeper, more authentic connections.',
        category: 'RELATIONSHIPS',
        type: 'ARTICLE',
        url: 'https://www.gottman.com/blog/category/relationships/',
        thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
      },
      {
        title: 'Progressive Muscle Relaxation Audio Guide',
        description: 'Follow along with this 20-minute guided audio session to systematically relax each muscle group and release physical tension held in the body.',
        category: 'ANXIETY',
        type: 'AUDIO',
        url: 'https://www.youtube.com/watch?v=1nZEdqcGVzo',
        thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      },
      {
        title: 'Depression Recovery Workbook',
        description: 'A structured worksheet series covering behavioral activation, mood tracking, and thought challenging techniques adapted from evidence-based depression treatment protocols.',
        category: 'DEPRESSION',
        type: 'WORKSHEET',
        url: 'https://www.therapistaid.com/therapy-worksheets/depression',
        thumbnail_url: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400',
      },
      {
        title: 'Mindful Sleep: Yoga Nidra for Deep Rest',
        description: 'Experience this ancient yogic technique adapted for modern insomnia sufferers. This guided practice induces physiological states equivalent to deep sleep.',
        category: 'SLEEP',
        type: 'AUDIO',
        url: 'https://www.youtube.com/watch?v=M0u9GST_j3s',
        thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      },
      {
        title: 'Stress Management Masterclass',
        description: 'A comprehensive video course covering the neuroscience of stress, proven management techniques, workplace burnout prevention, and lifestyle interventions for lasting relief.',
        category: 'STRESS',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=hnpQrMqDoqE',
        thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      },
    ],
  });

  // Crisis contacts
  await prisma.crisisContact.createMany({
    data: [
      {
        name: 'iCall',
        phone: '9152987821',
        description: 'Psychosocial helpline by TISS offering counselling, emotional support and mental health services across India.',
        country: '🇮🇳 India',
        available_24_7: false,
      },
      {
        name: 'Vandrevala Foundation',
        phone: '1860-2662-345',
        description: 'Free, confidential mental health helpline available round the clock for those in distress or crisis situations.',
        country: '🇮🇳 India',
        available_24_7: true,
      },
      {
        name: 'AASRA',
        phone: '9820466627',
        description: 'Volunteer-run crisis center providing emotional support to people in distress, despair, or suicidal crisis.',
        country: '🇮🇳 India',
        available_24_7: true,
      },
      {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: 'Free and confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
        country: '🇺🇸 USA',
        available_24_7: true,
      },
      {
        name: 'Samaritans',
        phone: '116 123',
        description: 'Whatever you\'re going through — a bereavement, mental or physical illness, loneliness, abuse — we\'ll listen with empathy and respect.',
        country: '🇬🇧 UK',
        available_24_7: true,
      },
    ],
  });

  // Journal entries for demo patient
  const journalMoods = ['HAPPY', 'CALM', 'ANXIOUS', 'SAD', 'CALM', 'HAPPY', 'ANXIOUS'];
  const journalTitles = [
    'A New Beginning',
    'Finding Peace in the Morning',
    'Overwhelmed but Hopeful',
    'Missing Connection',
    'Small Victories',
    'Gratitude Practice',
    'Working Through Fears',
  ];
  const journalContents = [
    'Today felt like a fresh start. I woke up earlier than usual and watched the sunrise with a cup of tea. There\'s something profound about witnessing the world wake up gently. I\'m going to try to hold onto this feeling throughout the day.',
    'The morning meditation helped. Twenty minutes of stillness before the world started demanding things from me. I noticed how often I hold tension in my shoulders — such a small observation, but it felt important.',
    'Had a difficult meeting at work today. The pressure feels immense and I wasn\'t sure how to handle my reaction. But I remembered the breathing exercises and took a few moments before responding. Progress, even if small.',
    'Missing people today. The city feels especially large and isolating. Reached out to an old friend for the first time in months. She was happy to hear from me. Sometimes just knowing someone is there is enough.',
    'Applied the 5-4-3-2-1 grounding technique during the stressful commute. Five things I could see, four I could touch... by the time I got to one thing I could taste, I was calm. These tools actually work.',
    'Listed ten things I\'m grateful for today. Number one was coffee. Number three was this journal. It sounds silly but writing things down makes them real in a way that just thinking doesn\'t accomplish.',
    'Talked to Dr. Mitchell about the recurring worry patterns. She helped me reframe them as signals rather than threats. My anxiety is trying to protect me — it just needs better training on what\'s actually dangerous.',
  ];

  for (let i = 0; i < 7; i++) {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - (i * 4));
    await prisma.journalEntry.create({
      data: {
        user_id: patient.id,
        title: journalTitles[i],
        content_encrypted: journalContents[i],
        mood_tag: journalMoods[i],
        created_at: entryDate,
        updated_at: entryDate,
      },
    });
  }

  // 30 days of mood checkins for demo patient
  const moodScores = [3, 4, 3, 2, 3, 4, 5, 4, 4, 3, 2, 3, 3, 4, 4, 5, 5, 4, 3, 3, 4, 4, 3, 2, 3, 4, 5, 4, 4, 5];
  for (let i = 29; i >= 0; i--) {
    const checkinDate = new Date();
    checkinDate.setDate(checkinDate.getDate() - i);
    checkinDate.setHours(9, 0, 0, 0);
    await prisma.moodCheckin.create({
      data: {
        user_id: patient.id,
        mood_score: moodScores[29 - i],
        checked_in_at: checkinDate,
      },
    });
  }

  // Notifications for demo patient
  await prisma.notification.createMany({
    data: [
      {
        user_id: patient.id,
        title: 'Session Confirmed',
        body: 'Your session with Dr. Sarah Mitchell is confirmed for tomorrow at 2:00 PM.',
        type: 'session',
        is_read: false,
      },
      {
        user_id: patient.id,
        title: 'Daily Check-in Reminder',
        body: "Don't forget to log your mood today. How are you feeling?",
        type: 'reminder',
        is_read: false,
      },
      {
        user_id: patient.id,
        title: 'New Resource Available',
        body: 'A new mindfulness audio guide has been added to your resources.',
        type: 'resource',
        is_read: true,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  👤 Patient:   patient@demo.com   / Demo@1234');
  console.log('  🩺 Therapist: therapist@demo.com / Demo@1234');
  console.log('  🔑 Admin:     admin@serenova.com / Admin@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
