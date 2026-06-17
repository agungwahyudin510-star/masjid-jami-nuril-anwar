"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X } from "lucide-react";

type Hadith = {
  number: number;
  arab: string;
  id: string;
  book: string;
  bookLabel: string;
  color: string;
  border: string;
  bg: string;
  tags: string[];
};

const HADIST_DATA: Hadith[] = [
  // NIAT & AMAL
  { number:1, arab:"إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", id:"Sesungguhnya setiap amalan tergantung pada niatnya. Dan sesungguhnya setiap orang akan mendapatkan apa yang ia niatkan.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["niat","amal","ibadah"] },
  { number:54, arab:"مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ", id:"Barangsiapa membuat perkara baru dalam urusan (agama) kami yang bukan bagian darinya, maka hal itu tertolak.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["bidah","sunnah","amal"] },

  // SHOLAT
  { number:227, arab:"الصَّلَاةُ عِمَادُ الدِّينِ", id:"Sholat adalah tiang agama. Barangsiapa mendirikannya maka ia telah menegakkan agama, dan barangsiapa meninggalkannya maka ia telah merobohkan agama.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["sholat","agama","ibadah"] },
  { number:465, arab:"بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ", id:"Batas antara seseorang dengan kesyirikan dan kekufuran adalah meninggalkan sholat.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["sholat","kufur","syirik"] },
  { number:631, arab:"أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ صَلَاتُهُ", id:"Amalan yang pertama kali dihisab dari seorang hamba pada hari kiamat adalah sholatnya.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["sholat","kiamat","hisab"] },
  { number:615, arab:"صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي", id:"Sholatlah kalian sebagaimana kalian melihat aku sholat.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sholat","tata cara","ibadah"] },
  { number:574, arab:"لَا صَلَاةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ", id:"Tidak sah sholatnya orang yang tidak membaca Al-Fatihah.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sholat","fatihah","quran"] },
  { number:489, arab:"صَلَاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلَاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً", id:"Sholat berjamaah lebih utama daripada sholat sendirian dengan dua puluh tujuh derajat.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sholat","berjamaah","keutamaan"] },
  { number:1141, arab:"رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا", id:"Dua rakaat sholat fajar (sunnah subuh) lebih baik dari dunia dan seisinya.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["sholat","sunnah","subuh","keutamaan"] },
  { number:1163, arab:"أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ", id:"Sholat yang paling utama setelah sholat fardhu adalah sholat malam (tahajud).", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["sholat","tahajud","malam","keutamaan"] },

  // WUDHU
  { number:135, arab:"لَا تُقْبَلُ صَلَاةٌ بِغَيْرِ طُهُورٍ", id:"Tidak diterima sholat tanpa bersuci (wudhu).", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["wudhu","bersuci","sholat"] },
  { number:244, arab:"إِذَا تَوَضَّأَ الْعَبْدُ الْمُسْلِمُ خَرَجَتْ خَطَايَاهُ مَعَ الْمَاءِ", id:"Apabila seorang muslim berwudhu, keluarlah dosa-dosanya bersama air (yang mengalir).", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["wudhu","bersuci","dosa"] },

  // PUASA
  { number:1904, arab:"الصِّيَامُ جُنَّةٌ", id:"Puasa adalah perisai (dari api neraka dan dari perbuatan maksiat).", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","ramadan","keutamaan"] },
  { number:1894, arab:"مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", id:"Barangsiapa berpuasa Ramadhan dengan iman dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","ramadan","ampunan","iman"] },
  { number:1966, arab:"إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ", id:"Apabila Ramadhan tiba, pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan setan-setan dibelenggu.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","ramadan","surga","neraka"] },
  { number:2010, arab:"لِلصَّائِمِ فَرْحَتَانِ", id:"Orang yang berpuasa memiliki dua kebahagiaan: kebahagiaan ketika berbuka dan kebahagiaan ketika bertemu Rabbnya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","buka puasa","kebahagiaan"] },
  { number:1923, arab:"تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً", id:"Makan sahurlah kalian karena dalam sahur terdapat keberkahan.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","sahur","ramadan"] },
  { number:1994, arab:"مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ", id:"Barangsiapa tidak meninggalkan perkataan dusta dan pengamalannya, maka Allah tidak butuh ia meninggalkan makan dan minumnya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["puasa","akhlak","dusta"] },

  // ZAKAT
  { number:1395, arab:"بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ", id:"Islam dibangun di atas lima perkara: syahadat, mendirikan sholat, menunaikan zakat, haji, dan puasa Ramadhan.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["zakat","rukun islam","sholat","puasa","haji"] },
  { number:1403, arab:"مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", id:"Sedekah tidak akan mengurangi harta.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["zakat","sedekah","harta"] },

  // HAJI
  { number:1521, arab:"الْعُمْرَةُ إِلَى الْعُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا", id:"Umrah ke umrah berikutnya adalah penghapus dosa di antara keduanya, dan haji yang mabrur tidak ada balasannya kecuali surga.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["haji","umrah","dosa","surga"] },
  { number:1449, arab:"مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ", id:"Barangsiapa berhaji lalu tidak berkata kotor dan tidak berbuat kefasikan, ia kembali seperti hari dilahirkan ibunya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["haji","dosa","bersih"] },

  // DOA & DZIKIR
  { number:2704, arab:"الدُّعَاءُ هُوَ الْعِبَادَةُ", id:"Doa adalah ibadah.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["doa","ibadah","dzikir"] },
  { number:6307, arab:"أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ", id:"Keadaan seorang hamba paling dekat dengan Rabbnya adalah ketika ia sedang sujud.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["doa","sujud","sholat","dekat Allah"] },
  { number:6406, arab:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", id:"Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Allah Yang Maha Pengasih: Subhanallah wabihamdih, Subhanallahil azhim.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["dzikir","doa","subhanallah","keutamaan"] },
  { number:2692, arab:"مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", id:"Barangsiapa mengucapkan 'Laa ilaaha illallah wahdahu laa syariikalahu, lahul mulku walahul hamdu wahuwa ala kulli syai'in qadiir' seratus kali dalam sehari, maka baginya pahala seperti memerdekakan sepuluh budak.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["dzikir","doa","tahlil","keutamaan"] },

  // ADAB & AKHLAK
  { number:6018, arab:"إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ", id:"Sesungguhnya aku diutus hanya untuk menyempurnakan akhlak yang mulia.", book:"ahmad", bookLabel:"Musnad Ahmad", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.1)", tags:["akhlak","adab","nabi"] },
  { number:6064, arab:"الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", id:"Muslim (yang sejati) adalah orang yang kaum muslimin selamat dari lisan dan tangannya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["akhlak","muslim","lisan"] },
  { number:2309, arab:"اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا", id:"Bertakwalah kepada Allah di mana pun kamu berada, iringilah keburukan dengan kebaikan niscaya kebaikan itu menghapusnya, dan pergauilah manusia dengan akhlak yang baik.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["akhlak","takwa","kebaikan","taubat"] },
  { number:5765, arab:"لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", id:"Orang yang kuat bukanlah yang menang dalam gulat, tetapi orang yang kuat adalah yang mampu menahan dirinya ketika marah.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["akhlak","marah","sabar"] },
  { number:2560, arab:"لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا", id:"Janganlah kalian saling mendengki, saling menipu dalam jual beli, saling membenci, saling membelakangi, dan janganlah sebagian kalian membeli barang yang sedang ditawar orang lain.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["akhlak","dengki","hasad","ukhuwah"] },

  // ADAB MAKAN
  { number:5376, arab:"يَا غُلَامُ سَمِّ اللَّهَ وَكُلْ بِيَمِينِكَ وَكُلْ مِمَّا يَلِيكَ", id:"Wahai nak, bacalah bismillah, makanlah dengan tangan kananmu, dan makanlah dari yang ada di hadapanmu.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["adab makan","makan","bismillah"] },
  { number:5396, arab:"مَا مَلَأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ", id:"Tidaklah anak Adam memenuhi wadah yang lebih buruk dari perutnya. Cukuplah bagi manusia beberapa suap untuk menegakkan punggungnya.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["adab makan","makan","perut"] },

  // ADAB TIDUR
  { number:6311, arab:"إِذَا أَوَى أَحَدُكُمْ إِلَى فِرَاشِهِ فَلْيَنْفُضْ فِرَاشَهُ", id:"Apabila salah seorang di antara kalian hendak tidur, hendaklah ia mengibaskan kasurnya karena ia tidak tahu apa yang ada di atasnya, lalu bacalah: Bismika Rabbi wadha'tu janbi.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["adab tidur","tidur","doa"] },
  { number:247, arab:"إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ فَلَا يَغْمِسْ يَدَهُ فِي الْإِنَاءِ", id:"Apabila salah seorang di antara kalian bangun dari tidur, maka jangan ia mencelupkan tangannya ke dalam bejana sebelum mencucinya tiga kali.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["adab tidur","bangun tidur","bersuci"] },

  // NIKAH
  { number:5063, arab:"يَا مَعْشَرَ الشَّبَابِ مَنِ اسْتَطَاعَ مِنْكُمُ الْبَاءَةَ فَلْيَتَزَوَّجْ", id:"Wahai para pemuda, barangsiapa di antara kalian yang mampu menikah, maka menikahlah karena itu lebih menundukkan pandangan dan lebih menjaga kemaluan.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["nikah","pernikahan","pemuda"] },
  { number:1466, arab:"تُنْكَحُ الْمَرْأَةُ لِأَرْبَعٍ", id:"Wanita dinikahi karena empat hal: karena hartanya, keturunannya, kecantikannya, dan agamanya. Maka pilihlah yang beragama niscaya kamu beruntung.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["nikah","pernikahan","wanita"] },
  { number:3462, arab:"خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", id:"Sebaik-baik kalian adalah yang paling baik terhadap keluarganya (istrinya).", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["nikah","keluarga","istri","akhlak"] },

  // SABAR
  { number:1469, arab:"مَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ", id:"Tidaklah seseorang diberi pemberian yang lebih baik dan lebih luas daripada kesabaran.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sabar","ujian","keutamaan"] },
  { number:2999, arab:"عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ", id:"Sungguh menakjubkan urusan seorang mukmin. Semua urusannya adalah kebaikan. Jika ia mendapat kesenangan, ia bersyukur maka itu baik baginya. Jika ia ditimpa kesusahan, ia bersabar maka itu pun baik baginya.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["sabar","syukur","mukmin","ujian"] },

  // SYUKUR
  { number:2469, arab:"مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", id:"Barangsiapa yang tidak bersyukur kepada manusia, maka ia tidak bersyukur kepada Allah.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["syukur","akhlak","terima kasih"] },
  { number:5965, arab:"اُنْظُرُوا إِلَى مَنْ أَسْفَلَ مِنْكُمْ وَلَا تَنْظُرُوا إِلَى مَنْ هُوَ فَوْقَكُمْ", id:"Lihatlah orang yang berada di bawah kalian dan janganlah melihat orang yang berada di atas kalian. Itu lebih layak agar kalian tidak meremehkan nikmat Allah.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["syukur","nikmat","qanaah"] },

  // TAUBAT
  { number:2675, arab:"كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ", id:"Setiap anak Adam pasti berbuat salah, dan sebaik-baik orang yang berbuat salah adalah yang bertaubat.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["taubat","dosa","ampunan"] },
  { number:2703, arab:"لَوْ أَخْطَأْتُمْ حَتَّى تَبْلُغَ خَطَايَاكُمُ السَّمَاءَ ثُمَّ تُبْتُمْ لَتَابَ اللَّهُ عَلَيْكُمْ", id:"Seandainya kalian berbuat dosa hingga dosa-dosa kalian mencapai langit, kemudian kalian bertaubat, niscaya Allah menerima taubat kalian.", book:"ibnu-majah", bookLabel:"Sunan Ibnu Majah", color:"#c9a84c", border:"rgba(201,168,76,.25)", bg:"rgba(201,168,76,.1)", tags:["taubat","dosa","ampunan","rahmat"] },

  // SEDEKAH & INFAQ
  { number:1410, arab:"مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", id:"Sedekah tidak akan mengurangi harta. Allah tidak menambah bagi seorang yang pemaaf kecuali kemuliaan. Dan tidaklah seseorang merendahkan diri karena Allah melainkan Allah akan meninggikan derajatnya.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["sedekah","infaq","harta","keutamaan"] },
  { number:1442, arab:"اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ", id:"Jagalah diri kalian dari api neraka walaupun hanya dengan (bersedekah) sebelah kurma.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sedekah","infaq","neraka"] },
  { number:2787, arab:"أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ", id:"Sedekah yang paling utama adalah kamu bersedekah dalam keadaan sehat dan kikir, kamu mengharapkan kekayaan dan takut akan kefakiran.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["sedekah","infaq","keutamaan"] },

  // TAUHID & SYIRIK
  { number:6938, arab:"حَقُّ اللَّهِ عَلَى الْعِبَادِ أَنْ يَعْبُدُوهُ وَلَا يُشْرِكُوا بِهِ شَيْئًا", id:"Hak Allah atas hamba-Nya adalah mereka beribadah kepada-Nya dan tidak mempersekutukan-Nya dengan sesuatu pun.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["tauhid","syirik","ibadah"] },
  { number:87, arab:"اجْتَنِبُوا السَّبْعَ الْمُوبِقَاتِ", id:"Jauhilah tujuh dosa besar yang membinasakan: syirik kepada Allah, sihir, membunuh jiwa yang diharamkan Allah, memakan riba, memakan harta anak yatim, lari dari medan perang, dan menuduh zina wanita mukminah yang baik.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["tauhid","syirik","dosa besar"] },

  // ILMU
  { number:79, arab:"طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", id:"Menuntut ilmu adalah kewajiban bagi setiap muslim.", book:"ibnu-majah", bookLabel:"Sunan Ibnu Majah", color:"#c9a84c", border:"rgba(201,168,76,.25)", bg:"rgba(201,168,76,.1)", tags:["ilmu","belajar","kewajiban"] },
  { number:3641, arab:"مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", id:"Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan mudahkan baginya jalan menuju surga.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["ilmu","belajar","surga"] },

  // UKHUWAH
  { number:67, arab:"مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ", id:"Perumpamaan kaum mukminin dalam hal saling mencintai, menyayangi, dan berempati seperti satu tubuh. Apabila satu anggota tubuh sakit maka seluruh tubuh ikut merasakannya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["ukhuwah","persaudaraan","mukmin"] },
  { number:6065, arab:"لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", id:"Tidak sempurna iman seseorang di antara kalian hingga ia mencintai untuk saudaranya apa yang ia cintai untuk dirinya sendiri.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["ukhuwah","iman","persaudaraan"] },

  // JUAL BELI & RIBA
  { number:2083, arab:"الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا", id:"Penjual dan pembeli memiliki hak khiyar (pilihan) selama keduanya belum berpisah.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["jual beli","muamalah","perdagangan"] },
  { number:2085, arab:"الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ", id:"Yang halal itu jelas dan yang haram itu jelas. Di antara keduanya terdapat perkara-perkara yang samar.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["halal","haram","jual beli","muamalah"] },
  { number:2276, arab:"لَعَنَ رَسُولُ اللَّهِ آكِلَ الرِّبَا وَمُوكِلَهُ", id:"Rasulullah melaknat pemakan riba, orang yang memberi makan dari riba, penulisnya, dan dua saksinya. Beliau bersabda: mereka semua sama.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["riba","haram","jual beli"] },

  // SURGA & NERAKA
  { number:6093, arab:"حُفَّتِ الْجَنَّةُ بِالْمَكَارِهِ وَحُفَّتِ النَّارُ بِالشَّهَوَاتِ", id:"Surga dikelilingi dengan hal-hal yang tidak disukai (nafsu), sedangkan neraka dikelilingi dengan hal-hal yang diinginkan (syahwat).", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["surga","neraka","akhirat"] },
  { number:3241, arab:"مَوْضِعُ سَوْطٍ فِي الْجَنَّةِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا", id:"Tempat cambuk di surga lebih baik dari dunia dan seisinya.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["surga","akhirat","dunia"] },

  // ORANGTUA
  { number:5971, arab:"رِضَا اللَّهِ فِي رِضَا الْوَالِدَيْنِ وَسَخَطُ اللَّهِ فِي سَخَطِ الْوَالِدَيْنِ", id:"Keridhaan Allah ada pada keridhaan orang tua, dan kemurkaan Allah ada pada kemurkaan orang tua.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["orangtua","birrul walidain","akhlak"] },
  { number:5514, arab:"جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ فَقَالَ مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي قَالَ أُمُّكَ", id:"Seseorang datang kepada Rasulullah dan bertanya: siapa yang paling berhak aku perlakukan dengan baik? Beliau menjawab: ibumu. Ia bertanya lagi tiga kali dan jawabannya tetap ibumu. Pada keempat kalinya beliau menjawab: ayahmu.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["orangtua","ibu","ayah","birrul walidain"] },

  // KEBERSIHAN
  { number:223, arab:"الطَّهُورُ شَطْرُ الْإِيمَانِ", id:"Bersuci adalah setengah dari iman.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["kebersihan","bersuci","iman","wudhu"] },
  { number:5891, arab:"إِنَّ اللَّهَ طَيِّبٌ يُحِبُّ الطَّيِّبَ نَظِيفٌ يُحِبُّ النَّظَافَةَ", id:"Sesungguhnya Allah itu baik dan menyukai kebaikan, bersih dan menyukai kebersihan.", book:"tirmidzi", bookLabel:"Sunan Tirmidzi", color:"#9b59b6", border:"rgba(155,89,182,.25)", bg:"rgba(155,89,182,.1)", tags:["kebersihan","bersuci","Allah"] },

  // MASJID
  { number:450, arab:"مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ", id:"Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.", book:"bukhari", bookLabel:"Shahih Bukhari", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.1)", tags:["masjid","surga","amal jariyah"] },
  { number:660, arab:"أَحَبُّ الْبِلَادِ إِلَى اللَّهِ مَسَاجِدُهَا", id:"Tempat yang paling dicintai Allah adalah masjid-masjidnya, dan tempat yang paling dibenci Allah adalah pasar-pasarnya.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["masjid","ibadah","Allah"] },

  // AMAL JARIYAH
  { number:1631, arab:"إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ", id:"Apabila manusia meninggal dunia, terputuslah amalnya kecuali tiga hal: sedekah jariyah, ilmu yang bermanfaat, dan anak sholeh yang mendoakannya.", book:"muslim", bookLabel:"Shahih Muslim", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.1)", tags:["amal jariyah","sedekah","ilmu","anak"] },
];

const POPULAR_TAGS = ["sholat","puasa","doa","akhlak","sedekah","nikah","sabar","taubat","ilmu","masjid","zakat","wudhu","tauhid","ukhuwah","adab makan"];
const QUOTES = [
  {
    text: "Apa yang kau cari sedang mencarimu.",
    author: "Jalaluddin Rumi"
  },
  {
    text: "Jangan bersedih, sesungguhnya Allah bersama kita.",
    author: "QS. At-Taubah : 40"
  },
  {
    text: "Shalat adalah cahaya bagi seorang mukmin.",
    author: "HR. Muslim"
  },
  {
    text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    author: "HR. Ahmad"
  },
  {
    text: "Kesabaran adalah kunci datangnya pertolongan Allah.",
    author: "Nasihat Ulama"
  }
];
export default function HadistPage() {
  const [search, setSearch]     = useState("");
  const [results, setResults]   = useState<Hadith[]>([]);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

 async function doSearch(query: string) {
  if (!query.trim()) return;

  setSearched(true);
  setExpanded(null);
  setActiveTag(null);

  try {
    const res = await fetch(
      `/api/hadist?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error("Gagal mengambil data hadist");
    }

    const data = await res.json();

    setResults(data);
  } catch (error) {
    console.error(error);
    setResults([]);
  }
}

  function filterByTag(tag: string) {
    setActiveTag(tag);
    setSearch("");
    setSearched(true);
    setExpanded(null);
    const found = HADIST_DATA.filter(h => h.tags.includes(tag));
    setResults(found);
  }

  function reset() {
    setSearch(""); setResults([]); setSearched(false);
    setActiveTag(null); setExpanded(null);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-tap-highlight-color:transparent;}
        body{background:var(--msj-bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--msj-text-body);}
        .bg-base{position:fixed;inset:0;background:var(--msj-bg-gradient);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:var(--msj-pattern-opacity);z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");
          background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:var(--msj-bar);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .hd-root{position:relative;z-index:1;min-height:100vh;padding-bottom:48px;}
        .wrap{max-width:480px;margin:0 auto;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

        .hd-header{background:var(--msj-hadist-header-bg);border-radius:0 0 28px 28px;padding:56px 20px 24px;position:relative;overflow:hidden;border-bottom:1px solid var(--msj-gold-border);box-shadow:var(--msj-card-shadow);animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .hd-header::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 80% 20%,var(--msj-gold-bg) 0%,transparent 70%);}
        .hd-ring{position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;border:1px solid var(--msj-gold-border);pointer-events:none;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;color:var(--msj-gold-text);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;transition:color .2s;}
        .back-btn:hover{color:var(--msj-gold-bright);}
        .hd-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--msj-text-title);}
        .hd-sub{font-size:11px;color:var(--msj-text-sub);margin-top:3px;}

        .search-wrap{position:relative;margin:20px 20px 0;}
        .search-box{display:flex;align-items:center;gap:10px;background:var(--msj-input-bg);border:1px solid var(--msj-input-border);border-radius:14px;padding:12px 14px;transition:border-color .2s;}
        .search-box:focus-within{border-color:var(--msj-input-focus);}
        .search-input{flex:1;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--msj-input-text);background:transparent;}
        .search-input::placeholder{color:var(--msj-input-placeholder);}
        .search-btn{background:var(--msj-search-btn-bg);border:1px solid var(--msj-gold-border);border-radius:10px;padding:8px 16px;color:var(--msj-text-title);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .2s;}
        .search-btn:hover{border-color:var(--msj-gold-bright);}
        .clear-btn{background:none;border:none;cursor:pointer;padding:2px;color:var(--msj-text-muted);line-height:0;}

        .sec-head{display:flex;align-items:center;gap:10px;padding:0 20px;margin:20px 0 12px;}
        .sec-line{flex:1;height:1px;}
        .sl{background:var(--msj-divider-line-l);}
        .sr{background:var(--msj-divider-line-r);}
        .sec-text{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--msj-divider-text);white-space:nowrap;}

        .tags{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px;}
        .tag{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:var(--msj-gold-text);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .tag:hover,.tag.active{background:var(--msj-gold-bg);border-color:var(--msj-gold-bright);color:var(--msj-text-title);}

        .hadith-cards{display:flex;flex-direction:column;gap:12px;padding:0 20px;}
        .hadith-card{background:var(--msj-card-bg);border-radius:18px;padding:18px;position:relative;overflow:hidden;border:1px solid;animation:fadeUp .4s ease both;cursor:pointer;}
        .h-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}
        .arab-text{font-family:'Amiri',serif;font-size:19px;line-height:2;text-align:right;direction:rtl;color:var(--msj-text-title);padding:12px;border-radius:10px;margin-bottom:10px;border-right:3px solid;background:var(--msj-card-bg);}
        .terjemah{font-size:13px;line-height:1.75;color:var(--msj-text-desc);}
        .terjemah.collapsed{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
        .expand-btn{font-size:11px;font-weight:600;margin-top:8px;cursor:pointer;display:inline-block;}
        .h-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;}
        .h-tag{font-size:9px;padding:2px 8px;border-radius:10px;background:var(--msj-card-bg);color:var(--msj-text-muted);border:1px solid var(--msj-card-border);}
        .h-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--msj-card-border);}
        .h-source{display:flex;align-items:center;gap:6px;}
        .h-num{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--msj-card-bg);color:var(--msj-text-muted);}

        .empty-box{margin:0 20px;background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:18px;padding:40px 20px;text-align:center;}

        :root{
          --msj-hadist-header-bg:linear-gradient(160deg,#2a1a00 0%,#5c3a00 40%,#3d2500 100%);
          --msj-search-btn-bg:linear-gradient(135deg,#5c3a00,#8a5a00);
        }
        html:not(.dark){
          --msj-hadist-header-bg:linear-gradient(160deg,#f5e9d0 0%,#e8d5a8 40%,#eedfc0 100%);
          --msj-search-btn-bg:linear-gradient(135deg,rgba(201,168,76,.2),rgba(180,140,40,.15));
        }
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="bar bar-t"/><div className="bar bar-b"/>

      <div className="hd-root">
        <div className="hd-header">
          <div className="hd-ring"/>
          <div className="wrap" style={{position:"relative",zIndex:1}}>
            <Link href="/home" className="back-btn"><ArrowLeft size={15}/> Kembali</Link>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,flexShrink:0,background:"var(--msj-gold-bg)",border:"1px solid var(--msj-gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📜</div>
              <div>
                <div className="hd-title">Hadist</div>
                <div className="hd-sub">{HADIST_DATA.length} Hadist Pilihan · 9 Kitab</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-box">
            <Search size={15} color="var(--msj-gold-text)"/>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Cari hadist... (sholat, puasa, sabar...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doSearch(search); }}
              autoComplete="off"
            />
            {(search || searched) && (
              <button className="clear-btn" onClick={reset}><X size={14}/></button>
            )}
            <button className="search-btn" onClick={() => doSearch(search)} disabled={!search.trim()}>
              Cari
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <>
            <div className="sec-head">
              <div className="sec-line sl"/>
              <span className="sec-text">
                ✦ {results.length} Hadist {activeTag ? `— ${activeTag}` : "Ditemukan"} ✦
              </span>
              <div className="sec-line sr"/>
            </div>
            {results.length === 0 ? (
              <div className="empty-box">
                <div style={{fontSize:36,opacity:.3,marginBottom:12}}>🔍</div>
                <p style={{fontSize:14,fontWeight:600,color:"var(--msj-text-sub)"}}>Hadist tidak ditemukan</p>
                <p style={{fontSize:12,color:"var(--msj-text-muted)",marginTop:4}}>Coba pilih topik di bawah</p>
              </div>
            ) : (
              <div className="hadith-cards">
                {results.map((h, i) => (
                  <div key={i} className="hadith-card"
                    style={{borderColor:h.border,animationDelay:`${i*0.04}s`}}
                    onClick={() => setExpanded(expanded===i?null:i)}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${h.color}40,transparent)`}}/>
                    <div className="h-badge" style={{background:h.bg,color:h.color,border:`1px solid ${h.border}`}}>
                      <BookOpen size={9}/> {h.bookLabel}
                    </div>
                    <div className="arab-text" style={{borderRightColor:h.color}}>{h.arab}</div>
                    <p className={`terjemah ${expanded===i?"":"collapsed"}`}>{h.id}</p>
                    <span className="expand-btn" style={{color:h.color}}>
                      {expanded===i?"▲ Sembunyikan":"▼ Baca selengkapnya"}
                    </span>
                    <div className="h-tags">
                      {h.tags.slice(0,4).map(t => <span key={t} className="h-tag">{t}</span>)}
                    </div>
                    <div className="h-footer">
                      <div className="h-source">
                        <div style={{width:6,height:6,borderRadius:"50%",background:h.color,flexShrink:0}}/>
                        <span style={{fontSize:11,fontWeight:700,color:h.color}}>{h.bookLabel}</span>
                      </div>
                      <span className="h-num">No. {h.number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Topik */}
        <div className="sec-head">
          <div className="sec-line sl"/>
          <span className="sec-text">✦ Pilih Topik ✦</span>
          <div className="sec-line sr"/>
        </div>
        <div className="tags">
          {POPULAR_TAGS.map(t => (
            <button key={t} className={`tag ${activeTag===t?"active":""}`} onClick={() => filterByTag(t)}>
              {t}
            </button>
          ))}
        </div>

        <div style={{height:24}}/>
      </div>
    </>
  );
}