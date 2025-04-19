export function enteriesToMarkdown(entries:any[],type:string){
    if(!entries.length) return ''
    return(
        `## ${type}\n\n` +
        entries.map((entry:any)=>{
            const dateRange =entry.isCurrent ?
            `${entry.startDate} - Present`:
            `${entry.startDate} - ${entry.endDate}`
            return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
        }).join('\n\n')
    )
    
}