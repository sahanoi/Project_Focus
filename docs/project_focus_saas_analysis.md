# Executive Summary: Project Focus - SaaS / App Girişimi Analizi

## 1. DURUM ÖZETİ (SITUATION OVERVIEW)

**Project Focus**, React, TypeScript ve Vite ile geliştirilmiş, kullanıcıların günlük alışkanlıklarını takip etmelerini ve oyunlaştırma (gamification) ile bağlılıklarını artırmayı hedefleyen modern bir projedir. Girişim, teknik olarak sağlam bir temel (Tailwind CSS, Zustand, Recharts) üzerine inşa edilmiş olsa da, verilerin yerel cihazda (Local Storage) tutulması nedeniyle şu an için ölçeklenebilir bir "bulut tabanlı SaaS" (Software as a Service) olmaktan ziyade bir "solo yardımcı araç" konumundadır. Pazarda (Hevy, Habitica benzeri) rekabet edebilmek ve yatırıma uygun bir "App Girişimi" haline gelebilmek için acil bulut entegrasyonuna ve büyüme mekanizmalarına ihtiyaç duymaktadır.

## 2. TEMEL BULGULAR (KEY FINDINGS)

**Bulgu 1**: Veriler %100 oranında istemci tarafında (Local Storage) tutuluyor.
**Stratejik Çıkarım: Kullanıcı hesapları oluşturulamadığı için cihazlar arası senkronizasyon (cross-device sync) imkansızdır ve bu durum MRR (Aylık Tekrarlayan Gelir) abonelik modellerinin (Freemium/Pro) önünü tamamen kapatmaktadır.**

**Bulgu 2**: Sistemde seviye ve rozet (level & badge) tabanlı dahili bir oyunlaştırma (gamification) çekirdeği mevcuttur.
**Stratejik Çıkarım: Bu mekanizma, erken aşama "Viral Döngü" (Viral Loop) katsayısını (K-factor > 1.0) artırmak ve sosyal paylaşım (liderlik tablosu) özellikleri eklemek suretiyle D1-D7 (1. Gün - 7. Gün) kullanıcı tutundurma (retention) oranlarını dramatik ölçüde (%30-40) iyileştirmek için muazzam bir zemin sunar.**

**Bulgu 3**: Frontend mimarisi (Vite + React + Zustand) son derece modüler, hızlı ve moderndir.
**Stratejik Çıkarım: Backend-as-a-Service (BaaS) çözümleri (Örn: Supabase veya Firebase) entegre edilerek Go-to-Market (Pazara Çıkış) süresi en aza indirgenebilir ve pivot (yön değiştirme) maliyetleri çok düşük tutulabilir.**

## 3. İŞ ETKİSİ (BUSINESS IMPACT)

*   **Ekonomik Etki (Potansiyel Gelir)**: Kullanıcı hesaplarının (AuthContext) Backend'e bağlanması ile birlikte ilk "Focus Pro" premium abonelik lansmanının yapılması, projenin aylık gelir potansiyelini (Şu anki $0 MRR) gerçekçi SaaS çarpanlarına dönüştürecektir.
*   **Risk/Fırsat Büyüklüğü**: Bulut entegrasyonu tamamlanmadığı sürece uygulamanın silinmesi durumunda %100 veri kaybı riski vardır; bu durum uzun vadeli kullanıcı kaybına (Churn Rate: %80+) neden olur.
*   **Zaman Çizelgesi (Time Horizon)**: MVP'nin (Minimum Uygulanabilir Ürün) gerçek bir SaaS'a evrilmesi 1 aylık bir BaaS entegrasyon (Supabase) sprint'i ile gerçekleştirilebilir.

## 4. ÖNERİLER (RECOMMENDATIONS)

**[Kritik]**: Bulut Veritabanı ve Kimlik Doğrulama Entagrasyonu (Cloud Sync & Auth)
— **Sorumlu**: Kurucu / Geliştirici Ekip
— **Zaman Çizelgesi**: 14-21 Gün
— **Beklenen Sonuç**: Supabase kullanılarak verilerin buluta taşınması ve cihazlar arası %100 kesintisiz erişimin, veri kaybı olmaksızın sağlanması.

**[Yüksek]**: Freemium Gelir Modeli Uygulaması (Monetization)
— **Sorumlu**: Ürün / Strateji 
— **Zaman Çizelgesi**: 30-45 Gün
— **Beklenen Sonuç**: Temel alışkanlıkların ücretsiz olması, "Detaylı Analitik (Recharts tabanlı)" ve "Premium Rozetler" fonksiyonlarının aylık/yıllık abonelik modeliyle (Stripe entegrasyonu) satılması.

**[Orta]**: Sosyal Büyüme (Viral Loops - Growth Hacking)
— **Sorumlu**: Pazarlama / Growth
— **Zaman Çizelgesi**: 3. Çeyrek
— **Beklenen Sonuç**: Kullanıcıların ulaştıkları seviyeleri ve "Streak (Seri)" rozetlerini Instagram/X'te tek tuşla, estetik bir şekilde paylaşıp referans bağlantısıyla uygulamaya yeni kullanıcı getirmelerinin (Referral mechanic) sağlanması.

## 5. SONRAKİ ADIMLAR (NEXT STEPS)

1.  **[Hemen-1]**: `src/store` ve `src/utils` klasörlerindeki mevcut "Zustand" yerel depolama mantığını asenkron API çağrılarına uyumlu hale getirecek veri modeli mimarisinin çizilmesi. (Örn: `users`, `habits`, `user_badges` tabloları). — **Son Teslim**: 7 Gün
2.  **[Hemen-2]**: `package.json`'a Supabase ve temel Authentication yetenekleri için gerekli bağımlılıkların (`@supabase/supabase-js`) eklenmesi ve test edilmesi. — **Son Teslim**: 10 Gün

**Karar Noktası**: Uygulamanın bir yan proje olmaktan çıkıp tamamen ticarileşen bir SaaS ürünü (Supabase + Stripe) olarak pivot edip etmeyeceğinin kararı, BaaS entegrasyonuna başlanmadan önce netleştirilmelidir.
