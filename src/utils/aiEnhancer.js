export function simulateAIEnhancement(form, targetJob) {
  const jobTitle = targetJob?.title || 'Professional';
  const jobKeywords = targetJob?.skills || [];
  const reqSkills = targetJob?.preferredSkills || targetJob?.skills || [];
  
  // -- 1. Analyze Match and ATS Score
  const currentSkills = form.skills ? form.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
  const requiredLower = reqSkills.map(s => s.toLowerCase());
  
  const matchedSkills = currentSkills.filter(s => requiredLower.includes(s) || requiredLower.some(r => r.includes(s) || s.includes(r)));
  const missingSkills = reqSkills.filter(r => !currentSkills.some(s => s.toLowerCase().includes(r.toLowerCase())));
  
  const matchRatio = requiredLower.length > 0 ? (matchedSkills.length / requiredLower.length) : 0.8;
  const atsScore = Math.min(99, Math.max(65, Math.floor(matchRatio * 100) + 15)); // baseline boost for formatting
  
  const aiInsights = {
    atsScore,
    matchPercentage: Math.floor(matchRatio * 100),
    missingSkills: missingSkills.slice(0, 5),
    matchedKeywords: matchedSkills,
    suggestions: [
      `Add ${missingSkills.slice(0, 2).join(' and ')} to your skills section to improve ATS visibility.`,
      `Quantify your achievements in your experience section with metrics (e.g., "Increased sales by 20%").`,
      `Ensure your job titles map closely to ${jobTitle} to pass the initial keyword screen.`
    ].filter(s => s && !s.includes('Add  and'))
  };

  // -- 2. Generate Professional Summary (Removed per user request)
  const summary = '';
  const topSkills = [...new Set([...matchedSkills, ...currentSkills])].slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');

  // -- 3. Enhance Experience (Action Verbs & Keywords)
  const enhancedExperience = (form.experience || []).map(exp => {
    if (!exp.company && !exp.title) return exp;
    let resp = exp.responsibilities || '';
    
    // Just ensure there's basic formatting without rewriting entire bullet points
    if (resp.length > 0) {
      let bullets = resp.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          let l = line.trim();
          l = l.replace(/^[-•*]\s*/, '');
          // Keep the original text but ensure it starts with a bullet and capital letter
          return `• ${l.charAt(0).toUpperCase() + l.slice(1)}`;
        });
      resp = bullets.join('\n');
    }
    return { ...exp, responsibilities: resp };
  });

  // -- 4. Enhance Projects
  const enhancedProjects = (form.projects || []).map(proj => {
    if (!proj.title) return proj;
    let desc = proj.description || '';
    
    // Just ensure basic formatting
    if (desc.length > 0) {
      let bullets = desc.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          let l = line.trim();
          l = l.replace(/^[-•*]\s*/, '');
          return `• ${l.charAt(0).toUpperCase() + l.slice(1)}`;
        });
      desc = bullets.join('\n');
    }
    return { ...proj, description: desc };
  });

  // -- 5. Skill Reordering & Grouping
  // Preserve original skills, inject highly relevant missing ATS keywords gracefully
  const finalSkillsSet = new Set([...currentSkills]);
  matchedSkills.forEach(s => finalSkillsSet.add(s.toLowerCase()));
  missingSkills.slice(0, 3).forEach(s => finalSkillsSet.add(s.toLowerCase())); // Inject top 3 missing keywords
  
  const sortedSkillsList = [...finalSkillsSet].map(s => s.charAt(0).toUpperCase() + s.slice(1));
  
  const categories = {
    'Programming Languages': ['javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql'],
    'Frameworks & Technologies': ['react', 'react.js', 'vue', 'angular', 'next.js', 'svelte', 'node', 'node.js', 'express', 'express.js', 'django', 'flask', 'spring', 'laravel', 'tailwind', 'bootstrap', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'oracle', 'sqlite', 'cassandra'],
    'Data & ML': ['machine learning', 'deep learning', 'pandas', 'numpy', 'matplotlib', 'xgboost', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'nlp', 'data analysis'],
    'Tools': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'linux', 'nginx', 'git', 'github', 'jira', 'figma', 'postman', 'agile', 'scrum', 'webpack', 'vite', 'npm', 'yarn', 'vs code', 'jupyter notebook']
  };

  const groupedSkills = { 'Programming Languages': [], 'Frameworks & Technologies': [], 'Data & ML': [], 'Tools': [], Other: [] };
  
  sortedSkillsList.forEach(skill => {
    const sLower = skill.toLowerCase();
    let found = false;
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => sLower === k || sLower.includes(k))) {
        groupedSkills[cat].push(skill);
        found = true;
        break;
      }
    }
    if (!found) groupedSkills.Other.push(skill);
  });

  const optimizedSkillsString = sortedSkillsList.join(', ');

  // -- 6. Cover Letter Generation
  const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${targetJob?.company || 'your esteemed company'}. With a proven background in delivering high-quality solutions and a solid foundation in ${topSkills || 'relevant methodologies'}, I am confident in my ability to make an immediate impact on your team.

In my previous experience, I have successfully engineered robust systems and collaborated closely with cross-functional teams to exceed project requirements. I am particularly drawn to this role because it perfectly aligns with my passion for leveraging technology to solve complex business challenges. I possess strong capabilities in ${sortedSkillsList.slice(0, 4).join(', ')}, which I understand are critical for this position.

I would welcome the opportunity to discuss how my technical expertise and drive for innovation can contribute to the continued success of your organization. Thank you for your time and consideration.

Sincerely,
${form.name || 'Candidate'}`;

  return {
    ...form,
    summary,
    experience: enhancedExperience,
    projects: enhancedProjects,
    skills: optimizedSkillsString,
    groupedSkills,
    aiInsights,
    coverLetterText: coverLetter
  };
}
