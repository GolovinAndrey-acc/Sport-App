// =====================================================================
//  ДАННЫЕ ПРИЛОЖЕНИЯ — здесь меняются разделы, подвкладки и упражнения.
//  Чтобы убрать раздел — удали его блок { ... } целиком.
//  Чтобы добавить упражнение — впиши его в массив exercises нужной подвкладки.
//
//  Шаблон упражнения (все поля, кроме name, необязательные):
//  {
//    name: "Приседания со штангой",
//    muscles: "Квадрицепс, ягодицы",
//    sets: "3–4",
//    reps: "8–12",
//    rest: "90 сек",
//    technique: ["Шаг 1 ...", "Шаг 2 ..."],
//    progression: "Когда все подходы выполнены на верхней границе — +2,5 кг",
//    safety: "Колени смотрят в сторону носков, не заваливаются внутрь",
//    video: "https://..."
//  }
// =====================================================================

const SECTIONS = [
  {
    id: "legs", title: "Ноги", icon: "🦵", color: "#4f8cff",
    subs: [
      { id: "main",       title: "Основные",          exercises: [] },
      { id: "quads",      title: "Квадрицепс",        exercises: [] },
      { id: "hamstrings", title: "Бицепс бедра",      exercises: [] },
      { id: "glutes",     title: "Ягодицы",           exercises: [] },
      { id: "calves",     title: "Икры",              exercises: [] },
      { id: "ankle",      title: "Голеностоп и ахилл", exercises: [] },
    ],
  },
  {
    id: "arms", title: "Руки", icon: "💪", color: "#ff8a3d",
    subs: [
      { id: "main",      title: "Основные",   exercises: [] },
      { id: "forearms",  title: "Предплечья", exercises: [] },
      { id: "biceps",    title: "Бицепс",     exercises: [] },
      { id: "triceps",   title: "Трицепс",    exercises: [] },
      { id: "shoulders", title: "Плечи",      exercises: [] },
    ],
  },
  {
    id: "back", title: "Спина", icon: "🏋️", color: "#2ec4a6",
    subs: [
      { id: "main",      title: "Основные",       exercises: [] },
      { id: "lats",      title: "Широчайшие",     exercises: [] },
      { id: "traps",     title: "Трапеции",       exercises: [] },
      { id: "midback",   title: "Середина спины", exercises: [] },
      { id: "reardelts", title: "Задняя дельта",  exercises: [] },
      { id: "lower",     title: "Поясница",       exercises: [] },
    ],
  },
  {
    id: "chest", title: "Грудь", icon: "🛡️", color: "#e05d7b",
    subs: [
      { id: "main",  title: "Основные",   exercises: [] },
      { id: "upper", title: "Верх груди", exercises: [] },
    ],
  },
  {
    id: "core", title: "Кор и пресс", icon: "🎯", color: "#b07cff",
    subs: [
      { id: "main",      title: "Основные",     exercises: [] },
      { id: "abs",       title: "Пресс",        exercises: [] },
      { id: "obliques",  title: "Косые",        exercises: [] },
      { id: "stability", title: "Стабилизация", exercises: [] },
    ],
  },
  {
    id: "knee", title: "Восстановление коленей", icon: "🩹", color: "#f2c94c",
    subs: [
      { id: "warmup",   title: "Разминка",    exercises: [] },
      { id: "easy",     title: "Лёгкий",      exercises: [] },
      { id: "medium",   title: "Средний",     exercises: [] },
      { id: "advanced", title: "Продвинутый", exercises: [] },
    ],
  },
  {
    id: "backgym", title: "Гимнастика для спины", icon: "🧘", color: "#56ccf2",
    note: "Лечебные упражнения лучше подобрать вместе со специалистом ЛФК.",
    subs: [
      { id: "posture",  title: "Осанка",           exercises: [] },
      { id: "thoracic", title: "Грудной отдел",    exercises: [] },
      { id: "lumbar",   title: "Поясничный отдел", exercises: [] },
      { id: "stretch",  title: "Растяжка",         exercises: [] },
    ],
  },
];

// Вкладка «Анатомия» (нижняя панель): подвкладки по группам мышц и суставам.
// Сюда позже добавим описания мышц — поле exercises используется как список карточек.
const ANATOMY = {
  id: "anatomy", title: "Анатомия", icon: "🫀",
  subs: [
    { id: "legs",   title: "Ноги",               exercises: [] },
    { id: "arms",   title: "Руки и плечи",       exercises: [] },
    { id: "back",   title: "Спина",              exercises: [] },
    { id: "chest",  title: "Грудь",              exercises: [] },
    { id: "core",   title: "Кор и пресс",        exercises: [] },
    { id: "joints", title: "Суставы и связки",   exercises: [] },
  ],
};
