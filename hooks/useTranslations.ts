"use client"

import { useState, useEffect } from "react"

type Locale = "en" | "fa" | "ar"

interface TranslationMessages {
  [key: string]: any
}

const messages: Record<Locale, TranslationMessages> = {
  en: {
    app: {
      name: "AutoCast",
      tagline: "Transform your text into professional podcasts with AI",
      poweredBy: "Powered by AI",
      privacyNote: "Your data stays private. API calls are made directly from your browser.",
    },
    common: {
      error: "Error",
      loading: "Loading...",
      next: "Next",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      generate: "Generate",
      regenerate: "Regenerate",
      download: "Download",
      processing: "Processing...",
      generatingScript: "Generating podcast script...",
      refining: "Refining script...",
      synthesizing: "Synthesizing audio...",
      readingFiles: "Reading files...",
      summarizing: "Summarizing content...",
      stepContent: "Step content would be rendered here",
      tags: {
        aiScript: "AI Script Generation",
        voiceSynthesis: "Voice Synthesis",
        multiLanguage: "Multi-language Support",
        privacy: "Privacy-focused",
      },
    },
    navigation: {
      step: "Step {step}",
      steps: {
        input: "Content Input",
        structure: "Podcast Structure",
        review: "Script Review",
        audio: "Audio Generation",
      },
    },
    settings: {
      title: "Settings",
      description: "Configure your preferences and API settings",
      save: "Save Settings",
      language: {
        title: "Language",
        description: "Change the application interface language",
        english: "English",
        persian: "Persian (فارسی)",
        arabic: "Arabic (العربية)",
      },
      theme: {
        title: "Theme",
        description: "Change the application appearance",
        light: "Light",
        dark: "Dark",
        auto: "System",
      },
      apiKey: {
        title: "OpenAI API Key",
        description: "Required for generating podcast scripts and audio",
        placeholder: "Enter your OpenAI API key",
        save: "Save API key in browser",
        saved: "API key is securely saved in your browser",
        edit: "Edit",
        clear: "Clear",
      },
      model: {
        title: "AI Model",
        description: "Select the AI model for script generation",
      },
      advanced: {
        title: "Advanced Settings",
        description: "Configure advanced AI generation parameters",
        show: "Show",
        hide: "Hide",
        systemPrompt: {
          title: "System Prompt Template",
          description: "Select a pre-defined system prompt or create your own",
          custom: "Custom System Prompt",
          customPlaceholder: "Enter your custom system prompt here...",
          customDescription: "Write a custom system prompt to guide the AI in generating your podcast script",
        },
        temperature: {
          title: "Temperature",
          description:
            "Controls randomness: Lower values are more focused and deterministic, higher values are more creative and varied",
          conservative: "Conservative",
          balanced: "Balanced",
          creative: "Creative",
        },
        maxTokens: {
          title: "Maximum Length",
          description: "Maximum number of tokens (words/characters) in the generated script",
        },
      },
    },
    features: {
      ai: {
        title: "AI-Powered Script Generation",
        description: "Transform your text into engaging podcast scripts with advanced AI technology",
      },
      voice: {
        title: "Professional Voice Synthesis",
        description: "Convert your scripts into natural-sounding audio with high-quality voice synthesis",
      },
      language: {
        title: "Multi-language Support",
        description: "Create podcasts in multiple languages with native-sounding pronunciation",
      },
      privacy: {
        title: "Privacy-Focused",
        description: "Your content stays private - all processing happens through your own API key",
      },
    },
    errors: {
      apiKeyRequired: "OpenAI API key is required. Please enter it in Settings.",
      invalidApiKey: "Invalid API key. Please check your OpenAI API key.",
      textRequired: "Please enter some text or upload files.",
      missingFields: "Please fill in all required fields.",
      audioGeneration: "Failed to generate audio. Please check your script and API key.",
      readError: "Failed to read file: {name}",
      unsupportedFile: "Unsupported file type: {type} for file {name}",
      noFiles: "No valid files were found.",
    },
    systemPrompts: {
      default: {
        name: "Default",
        description: "Standard podcast script generation",
        prompt:
          "You are an expert podcast scriptwriter. Create engaging, conversational scripts that sound natural when read aloud.",
      },
      educational: {
        name: "Educational",
        description: "For informative and educational content",
        prompt:
          "You are an expert educational podcast scriptwriter. Create clear, informative scripts that explain complex topics in an accessible way while maintaining audience engagement.",
      },
      storytelling: {
        name: "Storytelling",
        description: "For narrative and story-driven podcasts",
        prompt:
          "You are an expert narrative podcast scriptwriter. Create compelling, story-driven scripts with strong narrative arcs, character development, and engaging plot points.",
      },
      conversational: {
        name: "Conversational",
        description: "For interview-style and multi-host podcasts",
        prompt:
          "You are an expert conversational podcast scriptwriter. Create natural-sounding dialogue between multiple speakers with realistic back-and-forth exchanges, including host questions and guest responses.",
      },
      professional: {
        name: "Professional",
        description: "For business and professional podcasts",
        prompt:
          "You are an expert business podcast scriptwriter. Create professional, authoritative scripts that convey expertise and credibility while remaining engaging and accessible.",
      },
      custom: {
        name: "Custom",
        description: "Use your own custom system prompt",
        prompt: "",
      },
    },
  },
  fa: {
    app: {
      name: "اتوکست",
      tagline: "متن خود را با هوش مصنوعی به پادکست‌های حرفه‌ای تبدیل کنید",
      poweredBy: "با قدرت هوش مصنوعی",
      privacyNote: "داده‌های شما خصوصی می‌ماند. تماس‌های API مستقیماً از مرورگر شما انجام می‌شود.",
    },
    common: {
      error: "خطا",
      loading: "در حال بارگذاری...",
      next: "بعدی",
      back: "قبلی",
      cancel: "لغو",
      save: "ذخیره",
      delete: "حذف",
      edit: "ویرایش",
      generate: "تولید",
      regenerate: "تولید مجدد",
      download: "دانلود",
      processing: "در حال پردازش...",
      generatingScript: "در حال تولید متن پادکست...",
      refining: "در حال بهبود متن...",
      synthesizing: "در حال تولید صدا...",
      readingFiles: "در حال خواندن فایل‌ها...",
      summarizing: "در حال خلاصه‌سازی محتوا...",
      stepContent: "محتوای مرحله اینجا نمایش داده می‌شود",
      tags: {
        aiScript: "تولید متن با هوش مصنوعی",
        voiceSynthesis: "سنتز صدا",
        multiLanguage: "پشتیبانی چند زبانه",
        privacy: "متمرکز بر حریم خصوصی",
      },
    },
    navigation: {
      step: "مرحله {step}",
      steps: {
        input: "ورود محتوا",
        structure: "ساختار پادکست",
        review: "بررسی متن",
        audio: "تولید صدا",
      },
    },
    settings: {
      title: "تنظیمات",
      description: "ترجیحات و تنظیمات API خود را پیکربندی کنید",
      save: "ذخیره تنظیمات",
      language: {
        title: "زبان",
        description: "زبان رابط کاربری برنامه را تغییر دهید",
        english: "انگلیسی",
        persian: "فارسی",
        arabic: "عربی",
      },
      theme: {
        title: "تم",
        description: "ظاهر برنامه را تغییر دهید",
        light: "روشن",
        dark: "تیره",
        auto: "سیستم",
      },
      apiKey: {
        title: "کلید API اوپن‌ای‌آی",
        description: "برای تولید متن‌های پادکست و صدا مورد نیاز است",
        placeholder: "کلید API اوپن‌ای‌آی خود را وارد کنید",
        save: "ذخیره کلید API در مرورگر",
        saved: "کلید API به صورت امن در مرورگر شما ذخیره شده است",
        edit: "ویرایش",
        clear: "پاک کردن",
      },
      model: {
        title: "مدل هوش مصنوعی",
        description: "مدل هوش مصنوعی را برای تولید متن انتخاب کنید",
      },
      advanced: {
        title: "تنظیمات پیشرفته",
        description: "پارامترهای پیشرفته تولید هوش مصنوعی را پیکربندی کنید",
        show: "نمایش",
        hide: "پنهان کردن",
        systemPrompt: {
          title: "قالب پرامپت سیستم",
          description: "یک پرامپت سیستم از پیش تعریف شده را انتخاب کنید یا پرامپت خود را ایجاد کنید",
          custom: "پرامپت سیستم سفارشی",
          customPlaceholder: "پرامپت سیستم سفارشی خود را اینجا وارد کنید...",
          customDescription: "یک پرامپت سیستم سفارشی بنویسید تا هوش مصنوعی را در تولید متن پادکست شما راهنمایی کند",
        },
        temperature: {
          title: "دما",
          description:
            "کنترل تصادفی بودن: مقادیر پایین‌تر متمرکزتر و قطعی‌تر هستند، مقادیر بالاتر خلاقانه‌تر و متنوع‌تر هستند",
          conservative: "محافظه‌کارانه",
          balanced: "متعادل",
          creative: "خلاقانه",
        },
        maxTokens: {
          title: "حداکثر طول",
          description: "حداکثر تعداد توکن‌ها (کلمات/کاراکترها) در متن تولید شده",
        },
      },
    },
    features: {
      ai: {
        title: "تولید متن با هوش مصنوعی",
        description: "متن خود را با فناوری پیشرفته هوش مصنوعی به متن‌های پادکست جذاب تبدیل کنید",
      },
      voice: {
        title: "سنتز صدای حرفه‌ای",
        description: "متن‌های خود را با سنتز صدای با کیفیت بالا به صدای طبیعی تبدیل کنید",
      },
      language: {
        title: "پشتیبانی چند زبانه",
        description: "پادکست‌ها را به چندین زبان با تلفظ بومی ایجاد کنید",
      },
      privacy: {
        title: "متمرکز بر حریم خصوصی",
        description: "محتوای شما خصوصی می‌ماند - تمام پردازش از طریق کلید API خود شما انجام می‌شود",
      },
    },
    errors: {
      apiKeyRequired: "کلید API اوپن‌ای‌آی مورد نیاز است. لطفاً آن را در تنظیمات وارد کنید.",
      invalidApiKey: "کلید API نامعتبر است. لطفاً کلید API اوپن‌ای‌آی خود را بررسی کنید.",
      textRequired: "لطفاً متنی را وارد کنید یا فایل‌ها را آپلود کنید.",
      missingFields: "لطفاً تمام فیلدهای مورد نیاز را پر کنید.",
      audioGeneration: "تولید صدا ناموفق بود. لطفاً متن و کلید API خود را بررسی کنید.",
      readError: "خواندن فایل ناموفق بود: {name}",
      unsupportedFile: "نوع فایل پشتیبانی نشده: {type} برای فایل {name}",
      noFiles: "هیچ فایل معتبری یافت نشد.",
    },
    systemPrompts: {
      default: {
        name: "پیش‌فرض",
        description: "تولید استاندارد متن پادکست",
        prompt:
          "شما یک نویسنده متن پادکست خبره هستید. متن‌های جذاب و گفتگویی ایجاد کنید که هنگام خواندن با صدای بلند طبیعی به نظر برسند.",
      },
      educational: {
        name: "آموزشی",
        description: "برای محتوای آموزشی و اطلاعاتی",
        prompt:
          "شما یک نویسنده متن پادکست آموزشی خبره هستید. متن‌های واضح و آموزنده ایجاد کنید که موضوعات پیچیده را به روشی قابل دسترس توضیح دهند و در عین حال مخاطب را جذب کنند.",
      },
      storytelling: {
        name: "داستان‌سرایی",
        description: "برای پادکست‌های روایی و داستان‌محور",
        prompt:
          "شما یک نویسنده متن پادکست روایی خبره هستید. متن‌های جذاب و داستان‌محور با قوس‌های روایی قوی، توسعه شخصیت و نقاط داستانی جذاب ایجاد کنید.",
      },
      conversational: {
        name: "گفتگویی",
        description: "برای پادکست‌های سبک مصاحبه و چند میزبانه",
        prompt:
          "شما یک نویسنده متن پادکست گفتگویی خبره هستید. گفتگوهای طبیعی بین چندین سخنران با تبادل‌های واقع‌گرایانه ایجاد کنید، از جمله سؤالات میزبان و پاسخ‌های مهمان.",
      },
      professional: {
        name: "حرفه‌ای",
        description: "برای پادکست‌های تجاری و حرفه‌ای",
        prompt:
          "شما یک نویسنده متن پادکست تجاری خبره هستید. متن‌های حرفه‌ای و مقتدرانه ایجاد کنید که تخصص و اعتبار را منتقل کنند و در عین حال جذاب و قابل دسترس باقی بمانند.",
      },
      custom: {
        name: "سفارشی",
        description: "از پرامپت سیستم سفارشی خود استفاده کنید",
        prompt: "",
      },
    },
  },
  ar: {
    app: {
      name: "أوتوكاست",
      tagline: "حوّل نصوصك إلى بودكاست احترافي باستخدام الذكاء الاصطناعي",
      poweredBy: "مدعوم بالذكاء الاصطناعي",
      privacyNote: "بياناتك تبقى خاصة. يتم إجراء مكالمات API مباشرة من متصفحك.",
    },
    common: {
      error: "خطأ",
      loading: "جاري التحميل...",
      next: "التالي",
      back: "السابق",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      generate: "توليد",
      regenerate: "إعادة توليد",
      download: "تحميل",
      processing: "جاري المعالجة...",
      generatingScript: "جاري توليد نص البودكاست...",
      refining: "جاري تحسين النص...",
      synthesizing: "جاري تركيب الصوت...",
      readingFiles: "جاري قراءة الملفات...",
      summarizing: "جاري تلخيص المحتوى...",
      stepContent: "سيتم عرض محتوى الخطوة هنا",
      tags: {
        aiScript: "توليد نص بالذكاء الاصطناعي",
        voiceSynthesis: "تركيب الصوت",
        multiLanguage: "دعم متعدد اللغات",
        privacy: "يركز على الخصوصية",
      },
    },
    navigation: {
      step: "الخطوة {step}",
      steps: {
        input: "إدخال المحتوى",
        structure: "هيكل البودكاست",
        review: "مراجعة النص",
        audio: "توليد الصوت",
      },
    },
    settings: {
      title: "الإعدادات",
      description: "قم بتكوين تفضيلاتك وإعدادات API",
      save: "حفظ الإعدادات",
      language: {
        title: "اللغة",
        description: "تغيير لغة واجهة التطبيق",
        english: "الإنجليزية",
        persian: "الفارسية",
        arabic: "العربية",
      },
      theme: {
        title: "السمة",
        description: "تغيير مظهر التطبيق",
        light: "فاتح",
        dark: "داكن",
        auto: "النظام",
      },
      apiKey: {
        title: "مفتاح API الخاص بـ OpenAI",
        description: "مطلوب لتوليد نصوص البودكاست والصوت",
        placeholder: "أدخل مفتاح API الخاص بـ OpenAI",
        save: "حفظ مفتاح API في المتصفح",
        saved: "تم حفظ مفتاح API بأمان في متصفحك",
        edit: "تعديل",
        clear: "مسح",
      },
      model: {
        title: "نموذج الذكاء الاصطناعي",
        description: "حدد نموذج الذكاء الاصطناعي لتوليد النص",
      },
      advanced: {
        title: "إعدادات متقدمة",
        description: "تكوين معلمات توليد الذكاء الاصطناعي المتقدمة",
        show: "إظهار",
        hide: "إخفاء",
        systemPrompt: {
          title: "قالب موجه النظام",
          description: "حدد موجه نظام محدد مسبقًا أو أنشئ موجهك الخاص",
          custom: "موجه نظام مخصص",
          customPlaceholder: "أدخل موجه النظام المخصص هنا...",
          customDescription: "اكتب موجه نظام مخصص لتوجيه الذكاء الاصطناعي في توليد نص البودكاست الخاص بك",
        },
        temperature: {
          title: "درجة الحرارة",
          description:
            "يتحكم في العشوائية: القيم الأقل تكون أكثر تركيزًا وتحديدًا، والقيم الأعلى تكون أكثر إبداعًا وتنوعًا",
          conservative: "محافظ",
          balanced: "متوازن",
          creative: "إبداعي",
        },
        maxTokens: {
          title: "الحد الأقصى للطول",
          description: "الحد الأقصى لعدد الرموز (الكلمات/الأحرف) في النص الذي تم إنشاؤه",
        },
      },
    },
    features: {
      ai: {
        title: "توليد نص مدعوم بالذكاء الاصطناعي",
        description: "حوّل نصوصك إلى نصوص بودكاست جذابة باستخدام تقنية الذكاء الاصطناعي المتقدمة",
      },
      voice: {
        title: "تركيب صوت احترافي",
        description: "حوّل نصوصك إلى صوت طبيعي باستخدام تركيب صوت عالي الجودة",
      },
      language: {
        title: "دعم متعدد اللغات",
        description: "أنشئ بودكاست بلغات متعددة بنطق يبدو أصليًا",
      },
      privacy: {
        title: "يركز على الخصوصية",
        description: "محتواك يبقى خاصًا - تتم جميع المعالجة من خلال مفتاح API الخاص بك",
      },
    },
    errors: {
      apiKeyRequired: "مفتاح API الخاص بـ OpenAI مطلوب. يرجى إدخاله في الإعدادات.",
      invalidApiKey: "مفتاح API غير صالح. يرجى التحقق من مفتاح API الخاص بـ OpenAI.",
      textRequired: "الرجاء إدخال بعض النصوص أو تحميل الملفات.",
      missingFields: "الرجاء ملء جميع الحقول المطلوبة.",
      audioGeneration: "فشل في توليد الصوت. يرجى التحقق من النص ومفتاح API الخاص بك.",
      readError: "فشل في قراءة الملف: {name}",
      unsupportedFile: "نوع الملف غير مدعوم: {type} للملف {name}",
      noFiles: "لم يتم العثور على ملفات صالحة.",
    },
    systemPrompts: {
      default: {
        name: "افتراضي",
        description: "توليد نص بودكاست قياسي",
        prompt: "أنت كاتب نصوص بودكاست خبير. أنشئ نصوصًا جذابة ومحادثة تبدو طبيعية عند قراءتها بصوت عالٍ.",
      },
      educational: {
        name: "تعليمي",
        description: "للمحتوى المعلوماتي والتعليمي",
        prompt:
          "أنت كاتب نصوص بودكاست تعليمي خبير. أنشئ نصوصًا واضحة ومفيدة تشرح الموضوعات المعقدة بطريقة سهلة الوصول مع الحفاظ على تفاعل الجمهور.",
      },
      storytelling: {
        name: "سرد القصص",
        description: "للبودكاست السردي والقصصي",
        prompt:
          "أنت كاتب نصوص بودكاست سردي خبير. أنشئ نصوصًا مقنعة وموجهة بالقصص مع أقواس سردية قوية، وتطوير الشخصيات، ونقاط حبكة جذابة.",
      },
      conversational: {
        name: "محادثة",
        description: "للبودكاست بأسلوب المقابلة ومتعدد المضيفين",
        prompt:
          "أنت كاتب نصوص بودكاست محادثة خبير. أنشئ حوارًا طبيعيًا بين عدة متحدثين مع تبادلات واقعية، بما في ذلك أسئلة المضيف وردود الضيف.",
      },
      professional: {
        name: "احترافي",
        description: "للبودكاست التجاري والمهني",
        prompt:
          "أنت كاتب نصوص بودكاست تجاري خبير. أنشئ نصوصًا احترافية وموثوقة تنقل الخبرة والمصداقية مع البقاء جذابًا وسهل الوصول إليه.",
      },
      custom: {
        name: "مخصص",
        description: "استخدم موجه النظام المخصص الخاص بك",
        prompt: "",
      },
    },
  },
}

const LOCAL_STORAGE_LOCALE_KEY = "autocast_locale"

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    // Get locale from localStorage or browser language
    const savedLocale = localStorage.getItem(LOCAL_STORAGE_LOCALE_KEY) as Locale
    if (savedLocale && ["en", "fa", "ar"].includes(savedLocale)) {
      setLocale(savedLocale)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split("-")[0] as Locale
      if (["en", "fa", "ar"].includes(browserLanguage)) {
        setLocale(browserLanguage)
      }
    }
  }, [])

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem(LOCAL_STORAGE_LOCALE_KEY, newLocale)
  }

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split(".")
    let value: any = messages[locale]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = messages.en
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found in fallback
          }
        }
        break
      }
    }

    if (typeof value === "string" && params) {
      // Replace placeholders like {name} with actual values
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match)
    }

    return typeof value === "string" ? value : key
  }

  return { t, locale, switchLanguage }
}

export function useLocale() {
  const { locale } = useTranslations()
  return locale
}
