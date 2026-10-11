export default function Footer() {
    const COLLABORATORS = [
        {
            id: "jurgenjacobsen",
            displayName: "Jürgen J.",
        }
    ];
    
    return (
        <footer className="mt-6 grid grid-cols-4 gap-6 rounded-sm border-2 border-black bg-white p-4 sm:p-6">
            <div>
                <h3 className="font-medium">
                    web-guide.tech
                </h3>
                <p className="mt-1 text-sm">
                    © 2026 Jürgen Jacobsen.<br/>
                    All rights reserved.
                </p>
            </div>
            <div className="col-span-3">
                <h3 className="font-medium">
                    Collaborators
                </h3>
                <div className="mt-1 grid grid-cols-3 gap-4 text-sm">
                    {
                        COLLABORATORS.map((u, i) => {
                            return (
                                <a href={"https://github.com/"+u.id} target="_blank" key={i} className="group">
                                    <div className="inline-flex items-center space-x-2">
                                        <img 
                                            src={`https://avatars.githubusercontent.com/${u.id}?size=128`}
                                            alt={u.displayName}
                                            className="size-6 rounded-sm"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://placehold.co/128x128?text=${encodeURIComponent(u.displayName[0] || "U")}`;
                                            }}
                                        /> 
                                        <span className="group-hover:underline decoration-2">{u.displayName}</span>
                                    </div>
                                </a>
                            )
                        })
                    }
                </div>
            </div>
        </footer>
    )
}