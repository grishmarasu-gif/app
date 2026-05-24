export function simulateAIEnhancement(form, targetJob) {
  const jobTitle = targetJob?.title || 'Professional';
  const jobKeywords = targetJob?.skills || [];
  
  // 1. Generate a Professional Summary
  const topSkills = form.skills ? form.skills.split(',').slice(0, 3).map(s => s.trim()).join(', ') : jobKeywords.slice(0, 3).join(', ');
  const summary = `Results-driven ${jobTitle} with a proven track record of designing and developing high-quality solutions. Expertise in ${topSkills || 'modern technologies'}, with a strong focus on optimizing performance, scalability, and user experience. Adept at collaborating with cross-functional teams to deliver impactful products that align with business objectives.`;

  // 2. Enhance Experience
  const enhancedExperience = form.experience.map(exp => {
    if (!exp.company && !exp.title) return exp;
    
    let resp = exp.responsibilities || '';
    
    // Simple heuristic improvements for raw text
    if (resp.length < 30 || /worked on/i.test(resp) || /did/i.test(resp)) {
      resp = `• Spearheaded the development and deployment of key features for the ${jobTitle} initiatives at ${exp.company || 'the organization'}.\n• Collaborated with cross-functional teams to identify requirements and translate them into robust technical solutions.\n• Optimized existing workflows, improving overall efficiency and system reliability.`;
    } else {
      // Ensure it's bulleted and uses strong verbs
      let bullets = resp.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          let l = line.trim();
          l = l.replace(/^[•\-\*]\s*/, ''); // remove existing bullets
          // Enhance weak verbs
          l = l.replace(/^worked on/i, 'Engineered and delivered');
          l = l.replace(/^made/i, 'Architected');
          l = l.replace(/^did/i, 'Executed');
          l = l.replace(/^helped with/i, 'Facilitated');
          l = l.replace(/^responsible for/i, 'Directed');
          return `• ${l.charAt(0).toUpperCase() + l.slice(1)}`;
        });
        
      // ONE-PAGE OPTIMIZATION: Keep max 3 bullet points per experience to prevent overflow
      if (bullets.length > 3) {
        bullets = bullets.slice(0, 3);
      }
      resp = bullets.join('\n');
    }

    return { ...exp, responsibilities: resp };
  });

  // 3. Enhance Projects
  const enhancedProjects = form.projects.map(proj => {
    if (!proj.title) return proj;
    
    let desc = proj.description || '';
    if (desc.length < 30 || /a project/i.test(desc)) {
      desc = `• Designed and developed a comprehensive ${proj.title} utilizing ${proj.techStack || 'modern frameworks'}.\n• Implemented core functionalities that enhanced user engagement and streamlined data processing.`;
    } else {
      let bullets = desc.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          let l = line.trim();
          l = l.replace(/^[•\-\*]\s*/, '');
          return `• ${l.charAt(0).toUpperCase() + l.slice(1)}`;
        });
        
      // ONE-PAGE OPTIMIZATION: Keep max 2 bullet points per project
      if (bullets.length > 2) {
        bullets = bullets.slice(0, 2);
      }
      desc = bullets.join('\n');
    }
    
    return { ...proj, description: desc };
  });

  // 4. Group Skills intelligently
  const allSkills = [...new Set([...(form.skills ? form.skills.split(',') : []), ...jobKeywords])].map(s => s.trim()).filter(Boolean);
  
  const categories = {
    Frontend: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'bootstrap', 'next.js', 'svelte'],
    Backend: ['node', 'express', 'django', 'flask', 'spring', 'java', 'python', 'c#', 'php', 'ruby', 'go', 'rust', 'laravel'],
    Database: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'oracle'],
    Cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'linux'],
    Tools: ['git', 'github', 'jira', 'figma', 'postman', 'agile', 'scrum', 'webpack', 'vite']
  };

  const groupedSkills = { Frontend: [], Backend: [], Database: [], Cloud: [], Tools: [], Other: [] };
  
  allSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    let found = false;
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => sLower.includes(k))) {
        groupedSkills[cat].push(skill);
        found = true;
        break;
      }
    }
    if (!found) groupedSkills.Other.push(skill);
  });

  // Re-build a clean comma string, but also provide grouped object for ATS template
  const optimizedSkillsString = allSkills.join(', ');

  return {
    ...form,
    summary,
    experience: enhancedExperience,
    projects: enhancedProjects,
    skills: optimizedSkillsString,
    groupedSkills // extra field used for professional layout
  };
}
