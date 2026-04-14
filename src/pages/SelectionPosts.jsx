// src/pages/SelectionPosts.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import './SelectionPosts.css';

import rawPostsData from '../data/sppivraw.json';
import detailedPostsData from '../data/sppiv.json';

const SelectionPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    examLevel: '',
    payLevel: '',
    classification: '',
    maxAge: '',
    hasExperience: '',
    skillTest: '',
    pwdSuitable: '',
    showUR: false,
    showSC: false,
    showST: false,
    showOBC: false,
    showEWS: false,
    showESM: false,
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('sscCart');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCart, setShowCart] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'srNo', direction: 'asc' });
  const itemsPerPage = 20;

  const filterPanelRef = useRef(null);

  const getRegionFullName = (code) => {
    const regionMap = {
      'CR': 'Central Region', 'ER': 'Eastern Region', 'KKR': 'Karnataka Kerala Region',
      'MPR': 'Madhya Pradesh Region', 'NER': 'North Eastern Region', 'NR': 'Northern Region',
      'NWR': 'North Western Region', 'SR': 'Southern Region', 'WR': 'Western Region'
    };
    return regionMap[code] || code;
  };

  const getRegionCode = (region) => {
    const regionMap = {
      'Central Region': 'CR',
      'Eastern Region': 'ER',
      'Karnataka Kerala Region': 'KKR',
      'Madhya Pradesh Region': 'MPR',
      'North Eastern Region': 'NER',
      'Northern Region': 'NR',
      'North Western Region': 'NWR',
      'Southern Region': 'SR',
      'Western Region': 'WR'
    };
    return regionMap[region] || region;
  };

  const extractDepartment = (details) => {
    if (!details) return '';
    let match = details.match(/Office Name\s*([^•]*?)(?=Additional Details|Grade Pay|$)/);
    if (match && match[1].trim() && match[1].trim() !== 'N/A') return match[1].trim();
    match = details.match(/Department Name\s*([^•]*?)(?=Office Name|Additional Details|Grade Pay|$)/);
    if (match && match[1].trim() && match[1].trim() !== 'N/A') return match[1].trim();
    match = details.match(/Additional Details of User Department\s*([^•]*?)(?=Grade Pay|$)/);
    if (match && match[1].trim() && match[1].trim() !== 'N/A') return match[1].trim();
    return '';
  };

  const extractMinistry = (details) => {
    if (!details) return '';
    const match = details.match(/Ministry Name\s*([^•]*?)(?=Department Name|$)/);
    return match ? match[1].trim() : '';
  };

  const extractAgeLimit = (details) => {
    if (!details) return { min: 18, max: 30 };
    const match = details.match(/Age Limit[^•]*?(\d+)\s*-\s*(\d+)/);
    return match ? { min: parseInt(match[1]), max: parseInt(match[2]) } : { min: 18, max: 30 };
  };

  const extractFullEducation = (details) => {
    if (!details) return '';
    let text = details;
    text = text.replace(/Level of Examination[^•]*/i, '').trim();
    text = text.replace(/Essential Qualifications\s*/i, '');
    text = text.replace(/●/g, '\n• ');
    text = text.replace(/##/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) {
      const eqMatch = details.match(/Essential Qualifications([^]*)$/i);
      if (eqMatch) {
        text = eqMatch[1].trim();
        text = text.replace(/●/g, '\n• ');
      }
    }
    return text || '';
  };

  const extractExperience = (details) => {
    if (!details) return false;
    return /experience/i.test(details);
  };

  const extractPwdSuitable = (details) => {
    if (!details) return 'No';
    const oh = details.includes('OHYes');
    const hh = details.includes('HHYes');
    const vh = details.includes('VHYes');
    if (oh && hh && vh) return 'Yes (All)';
    if (oh || hh || vh) return 'Yes (Partial)';
    if (details.includes('OHNo') && details.includes('HHNo') && details.includes('VHNo')) return 'No';
    return 'No';
  };

  const extractClassification = (details) => {
    if (!details) return '';
    const match = details.match(/Classification\s*([^•]*?)(?=Gender|Pwd|Requisition|$)/);
    return match ? match[1].trim() : '';
  };

  const extractGender = (details) => {
    if (!details) return '';
    const genders = [];
    if (details.includes('●Female')) genders.push('Female');
    if (details.includes('●Male')) genders.push('Male');
    if (details.includes('●Transgender')) genders.push('Transgender');
    return genders.length ? genders.join(', ') : 'All';
  };

  const extractExamLevel = (educationDetails) => {
    if (!educationDetails) return 'Other';
    const levelMatch = educationDetails.match(/Level of Examination\s*([^•]*)/);
    if (levelMatch) {
      const level = levelMatch[1].trim().toLowerCase();
      if (level.includes('graduation') || level.includes('graduate')) return 'Graduate';
      if (level.includes('higher secondary') || level.includes('10+2')) return '12th';
      if (level.includes('matriculation') || level.includes('10th')) return '10th';
    }
    const details = educationDetails.toLowerCase();
    if (details.includes('graduation') || details.includes('bachelor') || details.includes('master') || details.includes('degree')) return 'Graduate';
    if (details.includes('higher secondary') || details.includes('10+2') || details.includes('12th') || details.includes('intermediate')) return '12th';
    if (details.includes('matriculation') || details.includes('10th') || details.includes('sslc')) return '10th';
    return 'Other';
  };

  const extractPayLevel = (payScale) => {
    if (!payScale) return '';
    const match = payScale.match(/Level\s*(\d+)/);
    return match ? `Level ${match[1]}` : '';
  };

  const extractPayLevelNumber = (payScale) => {
    if (!payScale) return 0;
    const match = payScale.match(/Level\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const parseVacancies = (vacancyString) => {
    if (!vacancyString) return { ur: 0, sc: 0, st: 0, obc: 0, ews: 0, total: 0, esm: 0, pwdOh: 0, pwdHh: 0, pwdVh: 0, pwdOthers: 0 };
    return {
      ur: parseInt(vacancyString.match(/UR\s*(\d+)/i)?.[1]) || 0,
      sc: parseInt(vacancyString.match(/SC\s*(\d+)/i)?.[1]) || 0,
      st: parseInt(vacancyString.match(/ST\s*(\d+)/i)?.[1]) || 0,
      obc: parseInt(vacancyString.match(/OBC\s*(\d+)/i)?.[1]) || 0,
      ews: parseInt(vacancyString.match(/EWS\s*(\d+)/i)?.[1]) || 0,
      total: parseInt(vacancyString.match(/Total\s*(\d+)/i)?.[1]) || 0,
      esm: parseInt(vacancyString.match(/ESM\s*(\d+)/i)?.[1]) || 0,
      pwdOh: parseInt(vacancyString.match(/OH\s*(\d+)/i)?.[1]) || 0,
      pwdHh: parseInt(vacancyString.match(/HH\s*(\d+)/i)?.[1]) || 0,
      pwdVh: parseInt(vacancyString.match(/VH\s*(\d+)/i)?.[1]) || 0,
      pwdOthers: parseInt(vacancyString.match(/Others\s*(\d+)/i)?.[1]) || 0,
    };
  };

  const extractSkillTest = (departmentalDetails) => {
    if (!departmentalDetails) return 'No';
    return departmentalDetails.includes('Skill Test RequiredYes') ? 'Yes' : 'No';
  };

  useEffect(() => {
    try {
      const detailedMap = {};
      detailedPostsData.forEach(post => {
        detailedMap[post.postCode] = post;
      });

      const processedData = rawPostsData.map((rawPost, index) => {
        const detailedPost = detailedMap[rawPost['Post Code']];

        if (detailedPost) {
          const vacancies = parseVacancies(detailedPost.categoryWiseVacancy);
          return {
            srNo: index + 1,
            id: detailedPost.postCode,
            region: detailedPost.region || '',
            regionCode: getRegionCode(detailedPost.region),
            postCode: detailedPost.postCode,
            postName: detailedPost.postName,
            department: extractDepartment(detailedPost.departmentalDetails),
            ministry: extractMinistry(detailedPost.departmentalDetails),
            ageLimit: extractAgeLimit(detailedPost.additionalDetails),
            payScale: detailedPost.payScale,
            payLevel: extractPayLevel(detailedPost.payScale),
            payLevelNum: extractPayLevelNumber(detailedPost.payScale),
            examLevel: extractExamLevel(detailedPost.educationDetails),
            fullEducation: extractFullEducation(detailedPost.educationDetails),
            experience: extractExperience(detailedPost.educationDetails),
            gender: extractGender(detailedPost.additionalDetails),
            ...vacancies,
            pwdSuitable: extractPwdSuitable(detailedPost.additionalDetails),
            skillTest: extractSkillTest(detailedPost.departmentalDetails),
            classification: extractClassification(detailedPost.additionalDetails),
            advertisement: detailedPost.advertisement || '',
            rawEducationDetails: detailedPost.educationDetails,
            rawDepartmentalDetails: detailedPost.departmentalDetails,
            rawAdditionalDetails: detailedPost.additionalDetails,
          };
        } else {
          const numParts = rawPost.Details.match(/\d+/g);
          let vacancies = { ur: 0, sc: 0, st: 0, obc: 0, ews: 0, total: 0, esm: 0, pwdOh: 0, pwdHh: 0, pwdVh: 0, pwdOthers: 0 };

          if (numParts && numParts.length >= 11) {
            const nums = numParts.slice(-11).map(Number);
            vacancies = {
              sc: nums[0] || 0, st: nums[1] || 0, obc: nums[2] || 0, ur: nums[3] || 0,
              ews: nums[4] || 0, total: nums[5] || 0, esm: nums[6] || 0,
              pwdOh: nums[7] || 0, pwdHh: nums[8] || 0, pwdVh: nums[9] || 0, pwdOthers: nums[10] || 0,
            };
          }

          const ageMatch = rawPost.Details.match(/(\d+)\s*-\s*(\d+)/);
          let ageMin = 18, ageMax = 30;
          if (ageMatch) {
            ageMin = parseInt(ageMatch[1]);
            ageMax = parseInt(ageMatch[2]);
          }

          let postName = rawPost.Details;
          if (ageMatch) {
            const ageIndex = rawPost.Details.indexOf(ageMatch[0]);
            postName = rawPost.Details.substring(0, ageIndex).trim();
          }

          return {
            srNo: index + 1,
            id: rawPost['Post Code'],
            region: getRegionFullName(rawPost.Region),
            regionCode: rawPost.Region,
            postCode: rawPost['Post Code'],
            postName: postName,
            department: '',
            ministry: '',
            ageLimit: { min: ageMin, max: ageMax },
            payScale: '',
            payLevel: '',
            payLevelNum: 0,
            examLevel: 'Other',
            fullEducation: '',
            experience: false,
            gender: '',
            ...vacancies,
            pwdSuitable: 'Unknown',
            skillTest: 'No',
            classification: '',
            advertisement: 'Phase-XIV/2026/Selection Posts',
            rawEducationDetails: rawPost.Details,
            rawDepartmentalDetails: rawPost.Details,
            rawAdditionalDetails: rawPost.Details,
          };
        }
      });

      setPosts(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Failed to load posts data.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sscCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) &&
        !event.target.closest('.filter-btn')) {
        setShowFilterPanel(false);
      }
    };
    if (showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
        
        const searchableText = `
          ${post.srNo}
          ${post.postName}
          ${post.postCode}
          ${post.region}
          ${post.regionCode}
          ${post.department}
          ${post.ministry}
          ${post.classification}
          ${post.payScale}
          ${post.payLevel}
          ${post.gender}
          ${post.advertisement}
          ${post.ageLimit.min}
          ${post.ageLimit.max}
          ${post.pwdSuitable}
          ${post.experience ? 'experience required experience yes' : 'no experience required experience no'}
          ${post.skillTest === 'Yes' ? 'skill test required skill test yes' : 'no skill test skill test no'}
          ${post.fullEducation}
          ${post.rawEducationDetails || ''}
          ${post.rawDepartmentalDetails || ''}
          ${post.rawAdditionalDetails || ''}
          UR:${post.ur} SC:${post.sc} ST:${post.st} OBC:${post.obc} EWS:${post.ews} Total:${post.total}
          ESM:${post.esm} OH:${post.pwdOh} HH:${post.pwdHh} VH:${post.pwdVh} Others:${post.pwdOthers}
          ${post.examLevel}
          ${post.examLevel === '10th' ? 'matriculation 10th sslc' : ''}
          ${post.examLevel === '12th' ? 'higher secondary 10+2 intermediate 12th' : ''}
          ${post.examLevel === 'Graduate' ? 'graduation bachelor master degree graduate bsc msc btech be bcom ba ma' : ''}
        `.toLowerCase();
        
        const hasMatch = searchWords.some(word => searchableText.includes(word));
        if (!hasMatch) return false;
      }

      if (filters.region && post.region !== filters.region) return false;
      if (filters.examLevel && post.examLevel !== filters.examLevel) return false;
      if (filters.payLevel && post.payLevel !== filters.payLevel) return false;
      if (filters.classification && !post.classification.toLowerCase().includes(filters.classification.toLowerCase())) return false;
      
      if (filters.maxAge) {
        const userMaxAge = parseInt(filters.maxAge);
        if (!isNaN(userMaxAge) && userMaxAge > post.ageLimit.max) return false;
      }
      
      if (filters.hasExperience === 'yes' && !post.experience) return false;
      if (filters.hasExperience === 'no' && post.experience) return false;
      if (filters.skillTest === 'yes' && post.skillTest !== 'Yes') return false;
      if (filters.skillTest === 'no' && post.skillTest === 'Yes') return false;
      if (filters.pwdSuitable === 'yes' && post.pwdSuitable === 'No') return false;
      if (filters.pwdSuitable === 'no' && post.pwdSuitable.includes('Yes')) return false;
      
      if (filters.showUR && post.ur === 0) return false;
      if (filters.showSC && post.sc === 0) return false;
      if (filters.showST && post.st === 0) return false;
      if (filters.showOBC && post.obc === 0) return false;
      if (filters.showEWS && post.ews === 0) return false;
      if (filters.showESM && post.esm === 0) return false;

      return true;
    });
  }, [posts, searchTerm, filters]);

  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'srNo') {
        aVal = a.srNo;
        bVal = b.srNo;
      }
      if (sortConfig.key === 'ageLimit') {
        aVal = a.ageLimit.min;
        bVal = b.ageLimit.min;
      }
      if (sortConfig.key === 'payLevelNum') {
        aVal = a.payLevelNum;
        bVal = b.payLevelNum;
      }
      if (sortConfig.key === 'total') {
        aVal = a.total;
        bVal = b.total;
      }
      if (sortConfig.key === 'ur') {
        aVal = a.ur;
        bVal = b.ur;
      }
      if (sortConfig.key === 'sc') {
        aVal = a.sc;
        bVal = b.sc;
      }
      if (sortConfig.key === 'st') {
        aVal = a.st;
        bVal = b.st;
      }
      if (sortConfig.key === 'obc') {
        aVal = a.obc;
        bVal = b.obc;
      }
      if (sortConfig.key === 'ews') {
        aVal = a.ews;
        bVal = b.ews;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPosts, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / itemsPerPage));
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions = useMemo(() => ({
    regions: [...new Set(posts.map(p => p.region))].filter(Boolean).sort(),
    examLevels: ['10th', '12th', 'Graduate', 'Other'],
    payLevels: [...new Set(posts.map(p => p.payLevel))].filter(Boolean).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0]) || 0;
      const numB = parseInt(b.match(/\d+/)?.[0]) || 0;
      return numA - numB;
    }),
    classifications: [...new Set(posts.map(p => p.classification))].filter(Boolean).sort(),
  }), [posts]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const addToCart = (post) => {
    setCartItems(prev => {
      if (prev.some(item => item.postCode === post.postCode)) return prev;
      return [...prev, { ...post, cartId: Date.now() + Math.random() }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCartItems([]);
  const isInCart = (postCode) => cartItems.some(item => item.postCode === postCode);

  const resetFilters = () => {
    setFilters({
      region: '', examLevel: '', payLevel: '', classification: '',
      maxAge: '', hasExperience: '', skillTest: '', pwdSuitable: '',
      showUR: false, showSC: false, showST: false, showOBC: false, showEWS: false, showESM: false,
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach(v => { 
      if (v !== '' && v !== false) count++; 
    });
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  const printPost = (post) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSC Post - ${post.postName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; background: #fff; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #1e1b4b; font-size: 28px; margin-bottom: 10px; }
            .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #4f46e5; }
            .section h2 { color: #4f46e5; font-size: 18px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
            .value { font-size: 16px; color: #1e1b4b; font-weight: 500; }
            .education-content { white-space: pre-line; line-height: 1.6; }
            .vacancy-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
            .vacancy-card { background: white; padding: 20px; border-radius: 10px; text-align: center; }
            .vacancy-value { font-size: 32px; font-weight: 700; color: #4f46e5; }
            .total-box { background: #4f46e5; color: white; padding: 15px 25px; border-radius: 10px; display: inline-block; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
            .print-btn { background: #4f46e5; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px; }
            .close-btn { background: #6b7280; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${post.postName}</h1>
            <div>Post Code: ${post.postCode} | Region: ${post.region}</div>
          </div>
          <div class="section">
            <h2>Basic Information</h2>
            <div class="grid">
              <div><span class="label">Department</span><div class="value">${post.department || 'N/A'}</div></div>
              <div><span class="label">Ministry</span><div class="value">${post.ministry || 'N/A'}</div></div>
              <div><span class="label">Age Limit</span><div class="value">${post.ageLimit.min} - ${post.ageLimit.max} years</div></div>
              <div><span class="label">Pay Scale</span><div class="value">${post.payScale || 'N/A'}</div></div>
              <div><span class="label">Classification</span><div class="value">${post.classification || 'N/A'}</div></div>
              <div><span class="label">Gender</span><div class="value">${post.gender || 'All'}</div></div>
              <div><span class="label">Skill Test</span><div class="value">${post.skillTest === 'Yes' ? 'Required' : 'Not Required'}</div></div>
              <div><span class="label">PWD Suitable</span><div class="value">${post.pwdSuitable}</div></div>
            </div>
          </div>
          <div class="section">
            <h2>Educational Qualifications</h2>
            <div class="value education-content">${post.fullEducation || 'N/A'}</div>
            ${post.experience ? '<div style="margin-top: 15px;"><span class="label">Experience Required</span><div class="value">Yes</div></div>' : ''}
          </div>
          <div class="section">
            <h2>Vacancy Details</h2>
            <div class="vacancy-grid">
              <div class="vacancy-card"><div>UR</div><div class="vacancy-value">${post.ur}</div></div>
              <div class="vacancy-card"><div>SC</div><div class="vacancy-value">${post.sc}</div></div>
              <div class="vacancy-card"><div>ST</div><div class="vacancy-value">${post.st}</div></div>
              <div class="vacancy-card"><div>OBC</div><div class="vacancy-value">${post.obc}</div></div>
              <div class="vacancy-card"><div>EWS</div><div class="vacancy-value">${post.ews}</div></div>
            </div>
            <div class="total-box"><strong>Total Vacancies: ${post.total}</strong>${post.esm > 0 ? ` | ESM: ${post.esm}` : ''}</div>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button class="print-btn" onclick="window.print()">🖨️ Print</button>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const printCart = () => {
    const printWindow = window.open('', '_blank');
    const totalVacancies = cartItems.reduce((sum, item) => sum + item.total, 0);
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSC Selection Posts - Saved Posts</title>
          <style>
            * { margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
            h1 { color: #1e1b4b; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #4f46e5; color: white; padding: 15px; text-align: left; }
            td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
            @media print { .no-print { display: none; } }
            .print-btn { background: #4f46e5; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>📋 SSC Selection Posts - Saved Posts (${cartItems.length} posts, ${totalVacancies} total vacancies)</h1>
          <table>
            <thead><tr><th>#</th><th>Post Code</th><th>Post Name</th><th>Department</th><th>Region</th><th>Total</th></tr></thead>
            <tbody>
              ${cartItems.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.postCode}</td><td>${item.postName}</td><td>${item.department || 'N/A'}</td><td>${item.region}</td><td>${item.total}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="no-print" style="text-align: center;">
            <button class="print-btn" onclick="window.print()">🖨️ Print</button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 12px 30px; border-radius: 8px; cursor: pointer;">✕ Close</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1); pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="selection-posts-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading SSC Selection Posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selection-posts-page">
        <div className="container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="selection-posts-page">
      <div className="container">
        <div className="page-header">
          <div className="header-top">
            <div className="header-badge"><span>📋</span><span>SSC Phase-XIV/2026</span></div>
            <div className="header-stats">
              <span className="stat-item">📊 {posts.length} Total Posts</span>
              <span className="stat-item">🗺️ 9 Regions</span>
            </div>
          </div>
          <div className="header-main">
            <div>
              <h1 className="page-title">Selection Posts</h1>
              <p className="page-subtitle">Browse and filter available positions</p>
            </div>
            <div className="header-actions">
              <button className={`cart-toggle-btn ${cartItems.length > 0 ? 'has-items' : ''}`} onClick={() => setShowCart(!showCart)}>
                <span>🛒</span><span>My Cart</span>
                {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
              </button>
            </div>
          </div>
        </div>

        {showCart && (
          <div className="cart-panel">
            <div className="cart-header-bar">
              <h3><span>📌</span> Saved Posts ({cartItems.length})</h3>
              <div className="cart-actions">
                {cartItems.length > 0 && (
                  <>
                    <button className="cart-print-btn" onClick={printCart}><span>🖨️</span> Print</button>
                    <button className="cart-clear-btn" onClick={clearCart}>Clear All</button>
                  </>
                )}
                <button className="cart-close-btn" onClick={() => setShowCart(false)}>✕</button>
              </div>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty"><span className="empty-icon">🛒</span><p>Your cart is empty</p></div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item, idx) => (
                  <div key={item.cartId} className="cart-item">
                    <span className="cart-item-sno">{idx + 1}.</span>
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.postName}</span>
                      <span className="cart-item-meta">{item.postCode} • {item.regionCode}</span>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.cartId)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="search-filter-section">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search by any keyword (post name, code, department, education, etc.)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>}
          </div>
          <div className="filter-actions">
            <button className={`filter-btn ${showFilterPanel ? 'active' : ''}`} onClick={() => setShowFilterPanel(!showFilterPanel)}>
              <span>⚙️</span><span>Filters</span>
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
            <button className="clear-btn" onClick={resetFilters}>Clear</button>
          </div>
        </div>

        {showFilterPanel && (
          <div className="filter-panel" ref={filterPanelRef}>
            <div className="filter-panel-header">
              <h3>Advanced Filters</h3>
            </div>
            <div className="filter-grid">
              <div className="filter-group">
                <label>🌍 Region</label>
                <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}>
                  <option value="">All Regions (9)</option>
                  {filterOptions.regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>📚 Exam Level</label>
                <select value={filters.examLevel} onChange={(e) => setFilters({ ...filters, examLevel: e.target.value })}>
                  <option value="">All Levels</option>
                  <option value="10th">10th / Matriculation</option>
                  <option value="12th">12th / Higher Secondary</option>
                  <option value="Graduate">Graduate & Above</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="filter-group">
                <label>💰 Pay Level</label>
                <select value={filters.payLevel} onChange={(e) => setFilters({ ...filters, payLevel: e.target.value })}>
                  <option value="">All Pay Levels (1-8)</option>
                  {filterOptions.payLevels.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>🏛️ Classification</label>
                <select value={filters.classification} onChange={(e) => setFilters({ ...filters, classification: e.target.value })}>
                  <option value="">All Classifications</option>
                  {filterOptions.classifications.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>📅 Your Max Age</label>
                <input type="number" placeholder="e.g., 27" min="18" max="50" value={filters.maxAge} onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })} className="filter-input" />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Shows posts where max age ≥ your age</small>
              </div>
              <div className="filter-group">
                <label>💼 Experience</label>
                <select value={filters.hasExperience} onChange={(e) => setFilters({ ...filters, hasExperience: e.target.value })}>
                  <option value="">Any</option>
                  <option value="yes">Required</option>
                  <option value="no">Not Required</option>
                </select>
              </div>
              <div className="filter-group">
                <label>⌨️ Skill Test</label>
                <select value={filters.skillTest} onChange={(e) => setFilters({ ...filters, skillTest: e.target.value })}>
                  <option value="">Any</option>
                  <option value="yes">Required</option>
                  <option value="no">Not Required</option>
                </select>
              </div>
              <div className="filter-group">
                <label>♿ PWD Suitable</label>
                <select value={filters.pwdSuitable} onChange={(e) => setFilters({ ...filters, pwdSuitable: e.target.value })}>
                  <option value="">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="filter-section">
              <label className="filter-section-label">📊 Show posts with vacancies in:</label>
              <div className="category-filter-group">
                <label className="category-filter-item ur-filter">
                  <input type="checkbox" checked={filters.showUR} onChange={(e) => setFilters({ ...filters, showUR: e.target.checked })} />
                  <span>UR</span>
                </label>
                <label className="category-filter-item sc-filter">
                  <input type="checkbox" checked={filters.showSC} onChange={(e) => setFilters({ ...filters, showSC: e.target.checked })} />
                  <span>SC</span>
                </label>
                <label className="category-filter-item st-filter">
                  <input type="checkbox" checked={filters.showST} onChange={(e) => setFilters({ ...filters, showST: e.target.checked })} />
                  <span>ST</span>
                </label>
                <label className="category-filter-item obc-filter">
                  <input type="checkbox" checked={filters.showOBC} onChange={(e) => setFilters({ ...filters, showOBC: e.target.checked })} />
                  <span>OBC</span>
                </label>
                <label className="category-filter-item ews-filter">
                  <input type="checkbox" checked={filters.showEWS} onChange={(e) => setFilters({ ...filters, showEWS: e.target.checked })} />
                  <span>EWS</span>
                </label>
                <label className="category-filter-item esm-filter">
                  <input type="checkbox" checked={filters.showESM} onChange={(e) => setFilters({ ...filters, showESM: e.target.checked })} />
                  <span>ESM</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="results-summary">
          <div className="results-info">
            <span className="results-count">
              Showing <strong>{filteredPosts.length}</strong> of <strong>{posts.length}</strong> posts
            </span>
            <span className="results-vacancy-total">
              • <strong>{filteredPosts.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</strong> vacancies
            </span>
            {activeFilterCount > 0 && <span className="results-filtered">(filtered)</span>}
          </div>
          <div className="category-stats">
            <span className="category-stat ur"><span>UR:</span><span className="category-stat-value">{filteredPosts.reduce((sum, p) => sum + p.ur, 0)}</span></span>
            <span className="category-stat sc"><span>SC:</span><span className="category-stat-value">{filteredPosts.reduce((sum, p) => sum + p.sc, 0)}</span></span>
            <span className="category-stat st"><span>ST:</span><span className="category-stat-value">{filteredPosts.reduce((sum, p) => sum + p.st, 0)}</span></span>
            <span className="category-stat obc"><span>OBC:</span><span className="category-stat-value">{filteredPosts.reduce((sum, p) => sum + p.obc, 0)}</span></span>
            <span className="category-stat ews"><span>EWS:</span><span className="category-stat-value">{filteredPosts.reduce((sum, p) => sum + p.ews, 0)}</span></span>
          </div>
        </div>

        <div className="table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('srNo')} style={{ width: '50px' }}>S.No {sortConfig.key === 'srNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ width: '70px' }}>Region</th>
                <th style={{ width: '90px' }}>Post Code</th>
                <th style={{ minWidth: '200px' }}>Post Name</th>
                <th style={{ minWidth: '180px' }}>Department</th>
                <th onClick={() => handleSort('ageLimit')} style={{ width: '70px' }}>Age {sortConfig.key === 'ageLimit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('payLevelNum')} style={{ width: '80px' }}>Pay {sortConfig.key === 'payLevelNum' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ minWidth: '200px' }}>Exam Eligibility</th>
                <th style={{ width: '55px' }}>Skill</th>
                <th style={{ width: '55px' }}>Exp</th>
                <th onClick={() => handleSort('ur')} style={{ width: '45px' }}>UR {sortConfig.key === 'ur' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('sc')} style={{ width: '45px' }}>SC {sortConfig.key === 'sc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('st')} style={{ width: '45px' }}>ST {sortConfig.key === 'st' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('obc')} style={{ width: '45px' }}>OBC {sortConfig.key === 'obc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('ews')} style={{ width: '45px' }}>EWS {sortConfig.key === 'ews' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('total')} style={{ width: '55px' }}>Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.length === 0 ? (
                <tr><td colSpan="17" className="no-results-cell"><div className="no-results"><span className="no-results-icon">🔍</span><h3>No posts found</h3></div></td></tr>
              ) : (
                paginatedPosts.map((post) => (
                  <tr key={post.postCode}>
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{post.srNo}</td>
                    <td><span className="region-badge">{post.regionCode}</span></td>
                    <td><span className="post-code">{post.postCode}</span></td>
                    <td><span className="post-name" title={post.postName}>{post.postName}</span></td>
                    <td><span className="dept-name" title={post.department}>{post.department || '—'}</span></td>
                    <td>{post.ageLimit.min}-{post.ageLimit.max}</td>
                    <td><span className="pay-scale">{post.payLevel || '—'}</span></td>
                    <td>
                      <span className="exam-details">
                        <span className={`exam-level-badge level-${post.examLevel?.toLowerCase()}`}>{post.examLevel}</span>
                        <span className="exam-preview" title={post.fullEducation}>{post.fullEducation.substring(0, 50)}{post.fullEducation.length > 50 ? '...' : ''}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`skill-badge ${post.skillTest === 'Yes' ? 'skill-yes' : 'skill-no'}`}>{post.skillTest === 'Yes' ? '✓' : '—'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`exp-badge ${post.experience ? 'has-exp' : 'no-exp'}`}>{post.experience ? 'Yes' : 'No'}</span>
                    </td>
                    <td className={`vac-cell ${post.ur > 0 ? 'has-vacancy' : ''}`}>{post.ur || '—'}</td>
                    <td className={`vac-cell ${post.sc > 0 ? 'has-vacancy' : ''}`}>{post.sc || '—'}</td>
                    <td className={`vac-cell ${post.st > 0 ? 'has-vacancy' : ''}`}>{post.st || '—'}</td>
                    <td className={`vac-cell ${post.obc > 0 ? 'has-vacancy' : ''}`}>{post.obc || '—'}</td>
                    <td className={`vac-cell ${post.ews > 0 ? 'has-vacancy' : ''}`}>{post.ews || '—'}</td>
                    <td className="vac-cell total-cell"><strong>{post.total}</strong></td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn view-btn" onClick={() => { setSelectedPost(post); setShowModal(true); }} title="View">👁️</button>
                        <button className={`action-btn cart-add-btn ${isInCart(post.postCode) ? 'added' : ''}`} onClick={() => addToCart(post)} title={isInCart(post.postCode) ? 'In cart' : 'Add'}>
                          {isInCart(post.postCode) ? '✓' : '🛒'}
                        </button>
                        <button className="action-btn print-btn" onClick={() => printPost(post)} title="Print">🖨️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn prev" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>← Previous</button>
            <div className="pagination-numbers">
              {getPageNumbers().map((page, idx) => (
                page === '...' ? <span key={idx} className="pagination-ellipsis">...</span> :
                  <button key={page} className={`pagination-number ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
              ))}
            </div>
            <button className="pagination-btn next" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next →</button>
          </div>
        )}

        {showModal && selectedPost && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="modal-badge">{selectedPost.region}</span>
                  <h2>{selectedPost.postName}</h2>
                  <p className="modal-subtitle">Post Code: {selectedPost.postCode}</p>
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Department</label><span>{selectedPost.department || 'N/A'}</span></div>
                  <div className="detail-item"><label>Ministry</label><span>{selectedPost.ministry || 'N/A'}</span></div>
                  <div className="detail-item"><label>Age Limit</label><span>{selectedPost.ageLimit.min} - {selectedPost.ageLimit.max} years</span></div>
                  <div className="detail-item"><label>Pay Scale</label><span>{selectedPost.payScale || 'N/A'}</span></div>
                  <div className="detail-item"><label>Classification</label><span>{selectedPost.classification || 'N/A'}</span></div>
                  <div className="detail-item"><label>Gender</label><span>{selectedPost.gender || 'All'}</span></div>
                  <div className="detail-item"><label>Skill Test</label><span>{selectedPost.skillTest === 'Yes' ? 'Required' : 'Not Required'}</span></div>
                  <div className="detail-item"><label>PWD Suitable</label><span>{selectedPost.pwdSuitable}</span></div>
                </div>
                <div className="detail-section">
                  <h3>Educational Qualifications</h3>
                  <div className="education-content" style={{ whiteSpace: 'pre-line' }}>{selectedPost.fullEducation || 'N/A'}</div>
                  {selectedPost.experience && <p className="experience-note"><strong>Experience Required:</strong> Yes</p>}
                </div>
                <div className="detail-section">
                  <h3>Vacancy Details</h3>
                  <div className="vacancy-detail-grid">
                    <div className="vacancy-detail-card ur"><span className="cat-label">UR</span><span className="cat-value">{selectedPost.ur}</span></div>
                    <div className="vacancy-detail-card sc"><span className="cat-label">SC</span><span className="cat-value">{selectedPost.sc}</span></div>
                    <div className="vacancy-detail-card st"><span className="cat-label">ST</span><span className="cat-value">{selectedPost.st}</span></div>
                    <div className="vacancy-detail-card obc"><span className="cat-label">OBC</span><span className="cat-value">{selectedPost.obc}</span></div>
                    <div className="vacancy-detail-card ews"><span className="cat-label">EWS</span><span className="cat-value">{selectedPost.ews}</span></div>
                    <div className="vacancy-detail-card total"><span className="cat-label">Total</span><span className="cat-value">{selectedPost.total}</span></div>
                  </div>
                  {(selectedPost.esm > 0 || selectedPost.pwdOh > 0 || selectedPost.pwdHh > 0 || selectedPost.pwdVh > 0) && (
                    <div className="horizontal-vacancies">
                      <h4>Horizontal Reservations</h4>
                      <div className="horizontal-grid">
                        {selectedPost.esm > 0 && <span className="horizontal-badge esm">ESM: {selectedPost.esm}</span>}
                        {selectedPost.pwdOh > 0 && <span className="horizontal-badge oh">OH: {selectedPost.pwdOh}</span>}
                        {selectedPost.pwdHh > 0 && <span className="horizontal-badge hh">HH: {selectedPost.pwdHh}</span>}
                        {selectedPost.pwdVh > 0 && <span className="horizontal-badge vh">VH: {selectedPost.pwdVh}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-btn secondary" onClick={() => setShowModal(false)}>Close</button>
                <button className="modal-btn primary" onClick={() => { addToCart(selectedPost); setShowModal(false); }}>
                  🛒 {isInCart(selectedPost.postCode) ? 'Already in Cart' : 'Add to Cart'}
                </button>
                <button className="modal-btn print" onClick={() => printPost(selectedPost)}>🖨️ Print</button>
              </div>
            </div>
          </div>
        )}

        <div className="disclaimer-banner">
          <span>ℹ️</span>
          <span>Data from SSC Phase-XIV/2026. Verify with official website.</span>
          <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer">ssc.gov.in ↗️</a>
        </div>
      </div>
    </div>
  );
};

export default SelectionPosts;